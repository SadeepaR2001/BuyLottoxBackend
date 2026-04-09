import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
export declare class AuthService {
    private jwt;
    private config;
    private readonly prisma;
    private readonly smsService;
    constructor(jwt: JwtService, config: ConfigService, prisma: PrismaService, smsService: SmsService);
    register(name: string, mobileNumber: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            mobileNumber: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    login(mobileNumber: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            mobileNumber: string;
            role: import(".prisma/client").$Enums.Role;
            status: "ACTIVE";
        };
    }>;
    sendForgotPasswordOtp(mobileNumber: string): Promise<{
        message: string;
    }>;
    verifyForgotPasswordOtp(mobileNumber: string, code: string): Promise<{
        message: string;
    }>;
    resetPassword(mobileNumber: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
    resendOtp(mobileNumber: string): Promise<{
        message: string;
    }>;
    me(userId: string): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    private sign;
    private normalizeMobileNumber;
    private generateOtp;
    sendOtp(mobileNumber: string): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    verifyOtp(mobileNumber: string, code: string): Promise<{
        message: string;
    }>;
    private normalizeSriLankanNumber;
}
