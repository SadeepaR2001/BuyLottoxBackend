import { IsString, Matches } from 'class-validator'

export class ResendOtpDto {
  @IsString()
  @Matches(/^\d{10,15}$/)
  mobileNumber: string
}