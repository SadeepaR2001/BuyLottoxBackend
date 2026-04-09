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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const forgot_password_send_otp_dto_1 = require("./dto/forgot-password-send-otp.dto");
const verify_forgot_password_otp_dto_1 = require("./dto/verify-forgot-password-otp.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const resend_otp_dto_1 = require("./dto/resend-otp.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(body) {
        return this.authService.register(body.name, body.mobileNumber, body.password);
    }
    login(body) {
        return this.authService.login(body.mobileNumber, body.password);
    }
    sendOtp(body) {
        return this.authService.sendOtp(body.mobileNumber);
    }
    verifyOtp(body) {
        return this.authService.verifyOtp(body.mobileNumber, body.otp);
    }
    me(req) {
        return this.authService.me(req.user.userId);
    }
    sendForgotPasswordOtp(dto) {
        return this.authService.sendForgotPasswordOtp(dto.mobileNumber);
    }
    verifyForgotPasswordOtp(dto) {
        return this.authService.verifyForgotPasswordOtp(dto.mobileNumber, dto.code);
    }
    resetPassword(dto) {
        return this.authService.resetPassword(dto.mobileNumber, dto.code, dto.newPassword);
    }
    resendOtp(dto) {
        return this.authService.resendOtp(dto.mobileNumber);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('send-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('forgot-password/send-otp'),
    (0, common_1.Post)('forgot-password/send-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_send_otp_dto_1.ForgotPasswordSendOtpDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sendForgotPasswordOtp", null);
__decorate([
    (0, common_1.Post)('forgot-password/verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_forgot_password_otp_dto_1.VerifyForgotPasswordOtpDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyForgotPasswordOtp", null);
__decorate([
    (0, common_1.Post)('forgot-password/reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_otp_dto_1.ResendOtpDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendOtp", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map