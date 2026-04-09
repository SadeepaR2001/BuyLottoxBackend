import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import type { Role } from '@prisma/client'
import { UserStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { SmsService } from '../sms/sms.service'

@Injectable()
export class AuthService {
  constructor(
    // private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    // private smsService: SmsService,
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  async register(name: string, mobileNumber: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { mobileNumber } })
    if (exists) throw new BadRequestException('mobileNumber already registered')

    const hash = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: { name, mobileNumber, password: hash },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true },
    })

    return {
      accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
      user,
    }
  }

  async login(mobileNumber: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { mobileNumber } })
    if (!user) throw new UnauthorizedException('Invalid mobileNumber or password')

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account is blocked')
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new UnauthorizedException('Invalid mobileNumber or password')

    const safeUser = {
      id: user.id,
      name: user.name,
      mobileNumber: user.mobileNumber,
      role: user.role,
      status: user.status,
    }

    return {
      accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
      user: safeUser,
    }
  }
  async sendForgotPasswordOtp(mobileNumber: string) {
  const normalizedMobile = this.normalizeMobileNumber(mobileNumber)

  const user = await this.prisma.user.findUnique({
    where: { mobileNumber: normalizedMobile },
  })

  if (!user) {
    throw new BadRequestException('User not found')
  }

  await this.prisma.mobileOtp.updateMany({
    where: {
      mobileNumber: normalizedMobile,
    isUsed: false,
    },
    data: {
     isUsed: false,
    },
  })

  const code = this.generateOtp()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await this.prisma.mobileOtp.create({
    data: {
      mobileNumber: normalizedMobile,
      code,
      expiresAt,
     isUsed: false,
    },
  })

  await this.smsService.sendSms(
    normalizedMobile,
    `Your password reset OTP is ${code}. Valid for 5 minutes.`
  )

  return {
    message: 'OTP sent successfully',
  }
}
async verifyForgotPasswordOtp(mobileNumber: string, code: string) {
  const normalizedMobile = this.normalizeMobileNumber(mobileNumber)

  const otp = await this.prisma.mobileOtp.findFirst({
    where: {
      mobileNumber: normalizedMobile,
     isUsed: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!otp) {
    throw new BadRequestException('OTP not found')
  }

  if (otp.expiresAt < new Date()) {
    throw new BadRequestException('OTP expired')
  }

  if (otp.code !== code) {
    throw new BadRequestException('Invalid OTP')
  }

  return {
    message: 'OTP verified successfully',
  }
}
async resetPassword(mobileNumber: string, code: string, newPassword: string) {
  const normalizedMobile = this.normalizeMobileNumber(mobileNumber)

  const user = await this.prisma.user.findUnique({
    where: { mobileNumber: normalizedMobile },
  })

  if (!user) {
    throw new BadRequestException('User not found')
  }

  const otp = await this.prisma.mobileOtp.findFirst({
    where: {
      mobileNumber: normalizedMobile,
      isUsed: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!otp) {
    throw new BadRequestException('OTP not found')
  }

  if (otp.expiresAt < new Date()) {
    throw new BadRequestException('OTP expired')
  }

  if (otp.code !== code) {
    throw new BadRequestException('Invalid OTP')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await this.prisma.user.update({
    where: { mobileNumber: normalizedMobile },
    data: { password: hashedPassword },
  })

  await this.prisma.mobileOtp.update({
    where: { id: otp.id },
    data: {isUsed: false },
  })

  return {
    message: 'Password reset successfully',
  }
}
async resendOtp(mobileNumber: string) {
  const normalizedMobile = this.normalizeMobileNumber(mobileNumber)

  const user = await this.prisma.user.findUnique({
    where: { mobileNumber: normalizedMobile },
  })

  if (!user) {
    throw new BadRequestException('User not found')
  }

  const latestOtp = await this.prisma.mobileOtp.findFirst({
    where: {
      mobileNumber: normalizedMobile,
      isUsed: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (latestOtp) {
    const secondsPassed = Math.floor(
      (Date.now() - new Date(latestOtp.createdAt).getTime()) / 1000
    )

    if (secondsPassed < 30) {
      throw new BadRequestException(`Please wait ${30 - secondsPassed}s before resending OTP`)
    }

    await this.prisma.mobileOtp.updateMany({
      where: {
        mobileNumber: normalizedMobile,
        isUsed: false,
      },
      data: {
        isUsed: false,
      },
    })
  }

  const code = this.generateOtp()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await this.prisma.mobileOtp.create({
    data: {
      mobileNumber: normalizedMobile,
      code,
      expiresAt,
      isUsed: false,
    },
  })

  await this.smsService.sendSms(
    normalizedMobile,
    `Your OTP is ${code}. Valid for 5 minutes.`
  )

  return {
    message: 'OTP resent successfully',
  }
}

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true, createdAt: true },
    })
  }

  private sign(sub: string, mobileNumber: string, role: Role, name: string) {
    const secret = this.config.get<string>('JWT_ACCESS_SECRET') || 'dev_secret'
    const expiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    return this.jwt.sign({ sub, mobileNumber, role, name }, { secret, expiresIn })
  }
  private normalizeMobileNumber(mobileNumber: string): string {
  return mobileNumber.trim()
}
private generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
// async sendOtp(mobileNumber: string) {
//   if (!mobileNumber) {
//     throw new BadRequestException('Mobile number is required')
//   }

//   const code = Math.floor(100000 + Math.random() * 900000).toString()
//   const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

//   await this.prisma.mobileOtp.create({
//     data: {
//       mobileNumber,
//       code,
//       expiresAt,
//       verified: false,
//     },
//   })

//   await this.smsService.sendSms(
//     mobileNumber,
//     `Your BuyLottoX OTP is ${code}. Valid for 5 minutes.`,
//   )

//   return {
//     message: 'OTP sent successfully',
//   }
// }
// async verifyOtp(mobileNumber: string, code: string) {
//   const otp = await this.prisma.mobileOtp.findFirst({
//     where: {
//       mobileNumber,
//       code,
//       verified: false,
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   })

//   if (!otp) {
//     throw new BadRequestException('Invalid OTP')
//   }

//   if (otp.expiresAt < new Date()) {
//     throw new BadRequestException('OTP expired')
//   }

//   await this.prisma.mobileOtp.update({
//     where: { id: otp.id },
//     data: { verified: true },
//   })

//   await this.prisma.user.update({
//     where: { mobileNumber },
//     data: { isMobileVerified: true },
//   })

//   return {
//     message: 'Mobile number verified successfully',
//   }
// }
 async sendOtp(mobileNumber: string) {
    if (!mobileNumber) {
      throw new BadRequestException('Mobile number is required')
    }

    const normalizedMobile = this.normalizeSriLankanNumber(mobileNumber)
    const now = new Date()

    const existingActiveOtp = await this.prisma.mobileOtp.findFirst({
      where: {
        mobileNumber: normalizedMobile,
        isUsed: false,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingActiveOtp) {
      throw new BadRequestException('An OTP is already active. Please wait until it expires.')
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    const otpRow = await this.prisma.mobileOtp.create({
      data: {
        mobileNumber: normalizedMobile,
        code,
        expiresAt,
        isUsed: false,
      },
    })

    try {
      await this.smsService.sendSms(
        normalizedMobile,
        `Your BuyLottoX OTP is ${code}. Valid for 5 minutes.`,
      )

      return {
        message: 'OTP sent successfully',
        expiresAt,
      }
    } catch (error) {
      await this.prisma.mobileOtp.delete({
        where: { id: otpRow.id },
      })

      throw new BadRequestException('Failed to send OTP')
    }
  }

  async verifyOtp(mobileNumber: string, code: string) {
    const normalizedMobile = this.normalizeSriLankanNumber(mobileNumber)

    const otp = await this.prisma.mobileOtp.findFirst({
      where: {
        mobileNumber: normalizedMobile,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otp) {
      throw new BadRequestException('OTP not found')
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired')
    }

if (otp.code !== code) {      throw new BadRequestException('Invalid OTP')
    }

    await this.prisma.mobileOtp.update({
      where: { id: otp.id },
      data: { isUsed: true },    })

    const user = await this.prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    })

    if (user) {
      await this.prisma.user.update({
        where: { mobileNumber: normalizedMobile },
        data: { isMobileVerified: true },
      })
    }

    return {
      message: 'Mobile number verified successfully',
    }
  }

  private normalizeSriLankanNumber(input: string): string {
    const raw = input.replace(/\D/g, '')

    if (raw.startsWith('94') && raw.length === 11) return raw
    if (raw.startsWith('0') && raw.length === 10) return `94${raw.slice(1)}`
    if (raw.length === 9) return `94${raw}`

    return raw
  }
}
