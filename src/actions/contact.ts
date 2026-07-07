'use server'

import { sendEmail } from '@/actions/user'

const CONTACT_RECIPIENT = 'mueeza044@gmail.com'

export const submitContactForm = async (formData: {
  name: string
  email: string
  message: string
}) => {
  try {
    const name = formData.name?.trim()
    const email = formData.email?.trim()
    const message = formData.message?.trim()

    if (!name || !email || !message) {
      return { status: 400, data: 'Please fill in all fields.' }
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return { status: 400, data: 'Please enter a valid email address.' }
    }

    if (!process.env.MAILER_EMAIL || !process.env.MAILER_PASSWORD) {
      return {
        status: 503,
        data: 'Email service is not configured. Please try again later.',
      }
    }

    const subject = `ClipFlow Contact: ${name}`
    const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    const html = `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `

    const { transporter, mailOptions } = await sendEmail(
      CONTACT_RECIPIENT,
      subject,
      text,
      html
    )

    await transporter.sendMail({
      ...mailOptions,
      replyTo: email,
    })

    return { status: 200, data: 'Message sent successfully.' }
  } catch (error) {
    console.error('submitContactForm error:', error)
    return {
      status: 500,
      data: 'Failed to send your message. Please try again later.',
    }
  }
}
