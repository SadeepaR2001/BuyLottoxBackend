import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:\+94|94|0)?7\d{8}$/, {
    message: 'Please enter a valid Sri Lankan mobile number',
  })
  mobileNumber: string
}