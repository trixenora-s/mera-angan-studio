import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const otpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
})

export const contactRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
})

export async function limitOtpRequest(key: string) {
  const result = await otpRateLimiter.limit(key)
  return result
}

export async function limitContactRequest(key: string) {
  const result = await contactRateLimiter.limit(key)
  return result
}

export async function createPhoneLoginToken(phone: string) {
  const token = crypto.randomUUID()
  await redis.set(`otp-login:${phone}`, token, { ex: 120 })
  return token
}

export async function peekPhoneLoginToken(phone: string, token: string) {
  const stored = await redis.get(`otp-login:${phone}`)
  return stored === token
}

export async function consumePhoneLoginToken(phone: string, token: string) {
  const stored = await redis.get(`otp-login:${phone}`)
  if (stored !== token) {
    return false
  }
  await redis.del(`otp-login:${phone}`)
  return true
}
