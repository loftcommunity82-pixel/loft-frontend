'use server'

import { sendEmail } from '@/lib/email'
import { createLogger } from '@/lib/logger'

const log = createLogger('submit-profile')

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  city: string
  country: string
  nationality: string
  jobTitle: string
  summary: string
  skills: string[]
  experienceYears: number
}

interface EnglishTestResult {
  score: number
  level: string
  completedAt: Date
}

export const submitProfile = async (profileData: ProfileData, englishTestResult?: EnglishTestResult) => {
  try {
    const emailSent = await sendProfileNotificationEmail(
      profileData,
      englishTestResult
    )

    return {
      success: true,
      message: 'Profile submitted successfully! The company will review your application.',
      emailSent
    }
  } catch (error) {
    log.error('Error submitting profile', error)
    return { success: false, message: 'Failed to submit profile' }
  }
}

async function sendProfileNotificationEmail(
  profileData: ProfileData,
  englishTestResult?: EnglishTestResult
) {
  const companyEmail = process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@loftcommunity.com'

  const skillsHtml = profileData.skills && profileData.skills.length > 0
    ? profileData.skills.map(s => `<span style="background:#e0e0e0;padding:3px 10px;border-radius:15px;font-size:12px;margin:2px;display:inline-block">${s}</span>`).join('')
    : '<p>No skills added</p>'

  const testResultBg = englishTestResult && englishTestResult.score >= 50 ? '#d1fae5' : '#fee2e2'
  const testResultColor = englishTestResult && englishTestResult.score >= 50 ? '#059669' : '#dc2626'

  const resultHtml = englishTestResult ? `
    <div style="margin-bottom:20px">
      <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:5px">English Proficiency Test Results</h3>
      <div style="background:${testResultBg};padding:15px;border-radius:8px;margin-top:10px">
        <p><strong>Test Score:</strong> <span style="font-size:24px;font-weight:bold;color:${testResultColor}">${englishTestResult.score}%</span></p>
        <p><strong>Proficiency Level:</strong> <span style="color:${testResultColor}">${englishTestResult.level}</span></p>
        <p><strong>Status:</strong> <span style="color:${testResultColor}">${englishTestResult.score >= 50 ? 'PASSED' : 'NEEDS IMPROVEMENT'}</span></p>
        <p><strong>Test Date:</strong> ${new Date(englishTestResult.completedAt).toLocaleDateString()}</p>
      </div>
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#059669;color:white;padding:20px;text-align:center">
        <h1>New Applicant Profile Submission</h1>
      </div>
      <div style="padding:20px;background:#f9f9f9">
        <div style="margin-bottom:20px">
          <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:5px">Personal Information</h3>
          <p><strong>Full Name:</strong> ${profileData.firstName} ${profileData.lastName}</p>
          <p><strong>Email:</strong> ${profileData.email}</p>
          <p><strong>Phone:</strong> ${profileData.phone || 'Not provided'}</p>
          <p><strong>Date of Birth:</strong> ${profileData.dateOfBirth || 'Not provided'}</p>
          <p><strong>Nationality:</strong> ${profileData.nationality || 'Not provided'}</p>
          <p><strong>Location:</strong> ${profileData.city || ''}, ${profileData.country || ''}</p>
        </div>
        <div style="margin-bottom:20px">
          <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:5px">Professional Information</h3>
          <p><strong>Job Title:</strong> ${profileData.jobTitle || 'Not provided'}</p>
          <p><strong>Experience:</strong> ${profileData.experienceYears} years</p>
          <p><strong>Summary:</strong> ${profileData.summary || 'Not provided'}</p>
        </div>
        <div style="margin-bottom:20px">
          <h3 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:5px">Skills</h3>
          <div>${skillsHtml}</div>
        </div>
        ${resultHtml}
      </div>
      <div style="text-align:center;padding:20px;color:#666;font-size:12px">
        <p>This email was sent from Loft Community Employment Platform</p>
        <p>&copy; ${new Date().getFullYear()} Loft Community. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  const result = await sendEmail({
    to: companyEmail,
    subject: `New Applicant Profile: ${profileData.firstName} ${profileData.lastName}`,
    html,
  })

  return result.success
}
