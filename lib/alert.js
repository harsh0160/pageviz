import { CONTACT_EMAIL } from './plans'

// Emails the owner when something money-related failed quietly -- a paid upgrade
// that never landed, for example. Without this, a failed webhook is only a line
// in a log nobody reads, and the customer is the one who finds out.
//
// Two deliberate choices:
//  - The Resend client is built here, inside the call, not at module load. A route
//    that builds it at the top crashes the whole build when the key is missing.
//  - It never throws. An alert that fails must not also break the webhook that
//    called it -- Paddle would then retry a payment we already handled.
//
// ALERT_FROM should become a verified address on your own domain. Until that
// domain exists, Resend's onboarding sender works, but ONLY to the email address
// the Resend account itself was created with.
export async function alertOwner(subject, details) {
  console.error('ALERT:', subject, details)

  if (!process.env.RESEND_API_KEY) return
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.ALERT_FROM || 'Pageviz alerts <onboarding@resend.dev>',
      to: process.env.ALERT_TO || CONTACT_EMAIL,
      subject: `Pageviz alert: ${subject}`,
      text: `${subject}\n\n${JSON.stringify(details, null, 2)}\n\nTime: ${new Date().toISOString()}`,
    })
  } catch (err) {
    console.error('Alert email failed:', err?.message)
  }
}
