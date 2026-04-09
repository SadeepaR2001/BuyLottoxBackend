"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const sms_service_1 = require("../sms/sms.service");
let AuthService = class AuthService {
    constructor(jwt, config, prisma, smsService) {
        this.jwt = jwt;
        this.config = config;
        this.prisma = prisma;
        this.smsService = smsService;
    }
    async register(name, mobileNumber, password) {
        const exists = await this.prisma.user.findUnique({ where: { mobileNumber } });
        if (exists)
            throw new common_1.BadRequestException('mobileNumber already registered');
        const hash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: { name, mobileNumber, password: hash },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true },
        });
        return {
            accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
            user,
        };
    }
    async login(mobileNumber, password) {
        const user = await this.prisma.user.findUnique({ where: { mobileNumber } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid mobileNumber or password');
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new common_1.UnauthorizedException('Your account is blocked');
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid mobileNumber or password');
        const safeUser = {
            id: user.id,
            name: user.name,
            mobileNumber: user.mobileNumber,
            role: user.role,
            status: user.status,
        };
        return {
            accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
            user: safeUser,
        };
    }
    async sendForgotPasswordOtp(mobileNumber) {
        const normalizedMobile = this.normalizeMobileNumber(mobileNumber);
        const user = await this.prisma.user.findUnique({
            where: { mobileNumber: normalizedMobile },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        await this.prisma.mobileOtp.updateMany({
            where: {
                mobileNumber: normalizedMobile,
                isUsed: false,
            },
            data: {
                isUsed: false,
            },
        });
        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.mobileOtp.create({
            data: {
                mobileNumber: normalizedMobile,
                code,
                expiresAt,
                isUsed: false,
            },
        });
        await this.smsService.sendSms(normalizedMobile, `Your password reset OTP is ${code}. Valid for 5 minutes.`);
        return {
            message: 'OTP sent successfully',
        };
    }
    async verifyForgotPasswordOtp(mobileNumber, code) {
        const normalizedMobile = this.normalizeMobileNumber(mobileNumber);
        const otp = await this.prisma.mobileOtp.findFirst({
            where: {
                mobileNumber: normalizedMobile,
                isUsed: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('OTP not found');
        }
        if (otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP expired');
        }
        if (otp.code !== code) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        return {
            message: 'OTP verified successfully',
        };
    }
    async resetPassword(mobileNumber, code, newPassword) {
        const normalizedMobile = this.normalizeMobileNumber(mobileNumber);
        const user = await this.prisma.user.findUnique({
            where: { mobileNumber: normalizedMobile },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const otp = await this.prisma.mobileOtp.findFirst({
            where: {
                mobileNumber: normalizedMobile,
                isUsed: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('OTP not found');
        }
        if (otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP expired');
        }
        if (otp.code !== code) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { mobileNumber: normalizedMobile },
            data: { password: hashedPassword },
        });
        await this.prisma.mobileOtp.update({
            where: { id: otp.id },
            data: { isUsed: false },
        });
        return {
            message: 'Password reset successfully',
        };
    }
    async resendOtp(mobileNumber) {
        const normalizedMobile = this.normalizeMobileNumber(mobileNumber);
        const user = await this.prisma.user.findUnique({
            where: { mobileNumber: normalizedMobile },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const latestOtp = await this.prisma.mobileOtp.findFirst({
            where: {
                mobileNumber: normalizedMobile,
                isUsed: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (latestOtp) {
            const secondsPassed = Math.floor((Date.now() - new Date(latestOtp.createdAt).getTime()) / 1000);
            if (secondsPassed < 30) {
                throw new common_1.BadRequestException(`Please wait ${30 - secondsPassed}s before resending OTP`);
            }
            await this.prisma.mobileOtp.updateMany({
                where: {
                    mobileNumber: normalizedMobile,
                    isUsed: false,
                },
                data: {
                    isUsed: false,
                },
            });
        }
        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.mobileOtp.create({
            data: {
                mobileNumber: normalizedMobile,
                code,
                expiresAt,
                isUsed: false,
            },
        });
        await this.smsService.sendSms(normalizedMobile, `Your OTP is ${code}. Valid for 5 minutes.`);
        return {
            message: 'OTP resent successfully',
        };
    }
    async me(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true, createdAt: true },
        });
    }
    sign(sub, mobileNumber, role, name) {
        const secret = this.config.get('JWT_ACCESS_SECRET') || 'dev_secret';
        const expiresIn = this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m';
        return this.jwt.sign({ sub, mobileNumber, role, name }, { secret, expiresIn });
    }
    normalizeMobileNumber(mobileNumber) {
        return mobileNumber.trim();
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendOtp(mobileNumber) {
        if (!mobileNumber) {
            throw new common_1.BadRequestException('Mobile number is required');
        }
        const normalizedMobile = this.normalizeSriLankanNumber(mobileNumber);
        const now = new Date();
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
        });
        if (existingActiveOtp) {
            throw new common_1.BadRequestException('An OTP is already active. Please wait until it expires.');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const otpRow = await this.prisma.mobileOtp.create({
            data: {
                mobileNumber: normalizedMobile,
                code,
                expiresAt,
                isUsed: false,
            },
        });
        try {
            await this.smsService.sendSms(normalizedMobile, `Your BuyLottoX OTP is ${code}. Valid for 5 minutes.`);
            return {
                message: 'OTP sent successfully',
                expiresAt,
            };
        }
        catch (error) {
            await this.prisma.mobileOtp.delete({
                where: { id: otpRow.id },
            });
            throw new common_1.BadRequestException('Failed to send OTP');
        }
    }
    async verifyOtp(mobileNumber, code) {
        const normalizedMobile = this.normalizeSriLankanNumber(mobileNumber);
        const otp = await this.prisma.mobileOtp.findFirst({
            where: {
                mobileNumber: normalizedMobile,
                isUsed: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('OTP not found');
        }
        if (otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP expired');
        }
        if (otp.code !== code) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        await this.prisma.mobileOtp.update({
            where: { id: otp.id },
            data: { isUsed: true },
        });
        const user = await this.prisma.user.findUnique({
            where: { mobileNumber: normalizedMobile },
        });
        if (user) {
            await this.prisma.user.update({
                where: { mobileNumber: normalizedMobile },
                data: { isMobileVerified: true },
            });
        }
        return {
            message: 'Mobile number verified successfully',
        };
    }
    normalizeSriLankanNumber(input) {
        const raw = input.replace(/\D/g, '');
        if (raw.startsWith('94') && raw.length === 11)
            return raw;
        if (raw.startsWith('0') && raw.length === 10)
            return `94${raw.slice(1)}`;
        if (raw.length === 9)
            return `94${raw}`;
        return raw;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService,
        sms_service_1.SmsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map