
// import { Injectable, InternalServerErrorException } from '@nestjs/common'
// import { ConfigService } from '@nestjs/config'
// import axios from 'axios'

// @Injectable()
// export class SmsService {
//   constructor(private readonly config: ConfigService) {}

// async sendSms(mobileNumber: string, message: string) {
//   const baseUrl = this.config.get<string>('FITSMS_API_BASE_URL')
//   const token = this.config.get<string>('FITSMS_API_TOKEN')
//   const senderId = this.config.get<string>('FITSMS_SENDER_ID') || 'BuyLottoX'

//   console.log('ENV FITSMS_API_BASE_URL =', baseUrl)
//   console.log('ENV FITSMS_API_TOKEN =', token ? 'FOUND' : 'MISSING')
//   console.log('ENV FITSMS_SENDER_ID =', senderId)

//   if (!baseUrl) {
//     throw new InternalServerErrorException('FITSMS_API_BASE_URL is missing in .env')
//   }

//   const normalized = this.normalizeSriLankanNumber(mobileNumber)
//   const finalUrl = `${baseUrl.replace(/\/$/, '')}/sms/send`

//   console.log('FITSMS final URL =', finalUrl)

//   try {
//     const payload = {
//       sender_id: senderId,
//       recipient: normalized,
//       message,
//     }

//     console.log('FITSMS payload:', payload)

//     const response = await axios.post(finalUrl, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       timeout: 15000,
//     })

//     return response.data
//   } catch (error: any) {
//     console.error('FITSMS send failed status:', error?.response?.status)
//     console.error('FITSMS send failed data:', error?.response?.data)
//     console.error('FITSMS send failed message:', error?.message)

//     throw new InternalServerErrorException(
//       error?.response?.data?.message || error?.message || 'Failed to send OTP SMS',
//     )
//   }
// }
//   private normalizeSriLankanNumber(input: string) {
//     const raw = input.replace(/\D/g, '')

//     if (raw.startsWith('94') && raw.length === 11) return raw
//     if (raw.startsWith('0') && raw.length === 10) return `94${raw.slice(1)}`
//     return raw
//   }
// }

import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Injectable()
export class SmsService {
  constructor(private readonly config: ConfigService) {}

  async sendSms(mobileNumber: string, message: string) {
    const baseUrl = this.config.get<string>('FITSMS_API_BASE_URL')
    const token = this.config.get<string>('FITSMS_API_TOKEN')
    const senderId = this.config.get<string>('FITSMS_SENDER_ID') || 'BuyLottoX'

    if (!baseUrl) {
      throw new InternalServerErrorException(
        'FITSMS_API_BASE_URL is missing in .env',
      )
    }

    if (!token) {
      throw new InternalServerErrorException(
        'FITSMS_API_TOKEN is missing in .env',
      )
    }

    const normalized = this.normalizeSriLankanNumber(mobileNumber)
    const finalUrl = `${baseUrl.replace(/\/$/, '')}/sms/send`

    try {
      const payload = {
        sender_id: senderId,
        recipient: normalized,
        message,
      }

      console.log('FITSMS API BASE URL:', baseUrl)
      console.log('FITSMS final URL:', finalUrl)
      console.log('FITSMS payload:', payload)

      const response = await axios.post(finalUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      })

      console.log('FITSMS response status:', response.status)
      console.log('FITSMS response data:', response.data)

      if (response.data?.status === 'error') {
        throw new InternalServerErrorException(
          response.data?.message || 'Failed to send OTP SMS',
        )
      }

      return response.data
    } catch (error: any) {
      console.error('FITSMS send failed status:', error?.response?.status)
      console.error('FITSMS send failed data:', error?.response?.data)
      console.error('FITSMS send failed message:', error?.message)

      throw new InternalServerErrorException(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to send OTP SMS',
      )
    }
  }

  private normalizeSriLankanNumber(input: string): string {
    const raw = input.replace(/\D/g, '')

    if (raw.startsWith('94') && raw.length === 11) {
      return raw
    }

    if (raw.startsWith('0') && raw.length === 10) {
      return `94${raw.slice(1)}`
    }

    if (raw.length === 9) {
      return `94${raw}`
    }

    return raw
  }
}