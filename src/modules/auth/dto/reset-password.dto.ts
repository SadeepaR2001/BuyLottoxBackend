import { IsString, Matches, MinLength, Length } from 'class-validator'

export class ResetPasswordDto {
  @IsString()
  @Matches(/^\d{10,15}$/)
  mobileNumber: string

  @IsString()
  @Length(4, 6)
  code: string

  @IsString()
  @MinLength(6)
  newPassword: string
}