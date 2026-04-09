import { AuthService } from './auth.service';
import { ForgotPasswordSendOtpDto } from './dto/forgot-password-send-otp.dto';
import { VerifyForgotPasswordOtpDto } from './dto/verify-forgot-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        name: string;
        mobileNumber: string;
        password: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            mobileNumber: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    login(body: {
        mobileNumber: string;
        password: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            mobileNumber: string;
            role: import(".prisma/client").$Enums.Role;
            status: "ACTIVE";
        };
    }>;
    sendOtp(body: {
        mobileNumber: string;
    }): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    verifyOtp(body: {
        mobileNumber: string;
        otp: string;
    }): Promise<{
        message: string;
    }>;
    me(req: any): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    sendForgotPasswordOtp(dto: ForgotPasswordSendOtpDto): Promise<{
        message: string;
    }>;
    verifyForgotPasswordOtp(dto: VerifyForgotPasswordOtpDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    resendOtp(dto: ResendOtpDto): Promise<{
        message: string;
    }>;
}
