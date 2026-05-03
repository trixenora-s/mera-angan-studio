import Twilio from 'twilio'

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendPhoneOtp(phone: string) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!
  const verification = await client.verify.v2.services(serviceSid).verifications.create({
    to: phone,
    channel: 'sms',
    locale: 'en',
  })

  return verification.status === 'pending'
}

export async function verifyPhoneOtp(phone: string, code: string) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!
  try {
    const verificationCheck = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: phone,
      code,
    })
    return verificationCheck.status === 'approved'
  } catch (error) {
    console.error('Phone OTP verification error:', error)
    return false
  }
}
