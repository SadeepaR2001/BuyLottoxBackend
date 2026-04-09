// import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
// import { AuthGuard } from '@nestjs/passport'
// import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'
// import { AuthService } from './auth.service'
// import { LoginDto, RegisterDto } from './dto/auth.dto'
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

// @Controller('auth')
// export class AuthController {
//   [x: string]: any
//   constructor(private auth: AuthService) {}

//   @Post('register')
//   register(@Body() dto: RegisterDto) {
//     return this.auth.register(dto.name, dto.mobileNumber, dto.password)
//   }

//   @Post('login')
//   login(@Body() dto: LoginDto) {
//     return this.auth.login(dto.mobileNumber, dto.password)
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Get('me')
//   me(@CurrentUser() user: JwtUser) {
//     return this.auth.me(user.sub)
//   }
//   @Post('send-otp')
// sendOtp(@Body() body: { mobileNumber: string }) {
//   return this.authService.sendOtp(body.mobileNumber)
// }
// @Post('verify-otp')
// verifyOtp(@Body() body: { mobileNumber: string; code: string }) {
//   return this.authService.verifyOtp(body.mobileNumber, body.code)
// }
// }
// import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
// import { AuthService } from './auth.service'
// import { JwtAuthGuard } from './jwt-auth.guard'

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { ForgotPasswordSendOtpDto } from './dto/forgot-password-send-otp.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verify-forgot-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() body: { name: string; mobileNumber: string; password: string },
  ) {
    return this.authService.register(body.name, body.mobileNumber, body.password)
  }

  @Post('login')
  login(@Body() body: { mobileNumber: string; password: string }) {
    return this.authService.login(body.mobileNumber, body.password)
  }

  @Post('send-otp')
  sendOtp(@Body() body: { mobileNumber: string }) {
    return this.authService.sendOtp(body.mobileNumber)
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { mobileNumber: string; otp: string }) {
    return this.authService.verifyOtp(body.mobileNumber, body.otp)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.userId)
  }
  @Post('forgot-password/send-otp')
// sendForgotPasswordOtp(@Body() dto: ForgotPasswordSendOtpDto) {
//   return this.authService.sendForgotPasswordOtp(dto.mobileNumber)
// }
@Post('forgot-password/send-otp')
sendForgotPasswordOtp(@Body() dto: ForgotPasswordSendOtpDto) {
  return this.authService.sendForgotPasswordOtp(dto.mobileNumber)
}

@Post('forgot-password/verify-otp')
verifyForgotPasswordOtp(@Body() dto: VerifyForgotPasswordOtpDto) {
  return this.authService.verifyForgotPasswordOtp(dto.mobileNumber, dto.code)
}

@Post('forgot-password/reset')
resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto.mobileNumber, dto.code, dto.newPassword)
}

@Post('resend-otp')
resendOtp(@Body() dto: ResendOtpDto) {
  return this.authService.resendOtp(dto.mobileNumber)
}
  
}