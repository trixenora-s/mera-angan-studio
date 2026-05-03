import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const createRazorpayOrder = async (amount: number, currency = 'INR') => {
  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt: `receipt_${Date.now()}`,
  }

  return await razorpay.orders.create(options)
}

export const verifyRazorpayPayment = (orderId: string, paymentId: string, signature: string) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return expectedSignature === signature
}
