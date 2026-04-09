import { IsString, Matches, Length } from 'class-validator'

export class VerifyForgotPasswordOtpDto {
  @IsString()
  @Matches(/^\d{10,15}$/)
  mobileNumber: string

  @IsString()
  @Length(4, 6)
  code: string
}