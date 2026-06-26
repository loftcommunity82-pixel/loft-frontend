import { Resend } from "resend"
import { createLogger } from './logger'

const log = createLogger('email')

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend) {
    log.warn("Resend not configured, skipping email", { to, subject })
    return { success: false, error: "Resend not configured" }
  }

  try {
    const data = await resend.emails.send({
      from: "LoftCommunity <noreply@loftcommunity.com>",
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    log.error("Email error", error)
    return { success: false, error }
  }
}

export const emailTemplates = {
  applicationSubmitted: (jobTitle: string, companyName: string, to: string) => ({
    to,
    subject: `Application Submitted - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Application Submitted!</h1>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p>
          <p>You can track your application status in your LoftCommunity dashboard.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/applications" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Application
          </a>
        </body>
      </html>
    `,
  }),

  statusUpdate: (jobTitle: string, companyName: string, status: string, to: string) => ({
    to,
    subject: `Application Status Update - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Status Update</h1>
          <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is now <strong>${status}</strong>.</p>
          <p>Log in to your dashboard to see more details.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/applications" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Details
          </a>
        </body>
      </html>
    `,
  }),

  newMessage: (senderName: string, to: string) => ({
    to,
    subject: `New Message from ${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">New Message</h1>
          <p>You have received a new message from <strong>${senderName}</strong>.</p>
          <p>Log in to LoftCommunity to view and respond to the message.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/messages" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Message
          </a>
        </body>
      </html>
    `,
  }),

  newApplicant: (jobTitle: string, candidateName: string, to: string) => ({
    to,
    subject: `New Applicant for ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">New Applicant</h1>
          <p><strong>${candidateName}</strong> has applied for <strong>${jobTitle}</strong>.</p>
          <p>Review their profile in your employer dashboard.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/employer/dashboard" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Candidates
          </a>
        </body>
      </html>
    `,
  }),

  jobExpiring: (jobTitle: string, daysLeft: number, to: string) => ({
    to,
    subject: `Job Expiring - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Job Expiring Soon</h1>
          <p>Your job posting "<strong>${jobTitle}</strong>" will expire in <strong>${daysLeft} days</strong>.</p>
          <p>Renew or close the posting to continue receiving applications.</p>
          <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/employer/jobs" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Manage Job
          </a>
        </body>
      </html>
    `,
  }),
}
