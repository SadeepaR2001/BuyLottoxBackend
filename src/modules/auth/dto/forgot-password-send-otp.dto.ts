import { IsString, Matches } from 'class-validator'

export class ForgotPasswordSendOtpDto {
  @IsString()
  @Matches(/^\d{10,15}$/)
  mobileNumber: string
}