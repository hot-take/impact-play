/**
 * Notifications Utility
 * 
 * In a production environment, this would integrate with an email provider
 * such as Resend, SendGrid, or AWS SES to send emails.
 * For this assignment, it logs to the console.
 */

export async function sendWinnerAlertEmail(email: string, prizeAmount: number) {
  console.log(`[EMAIL DISPATCH] To: ${email}`)
  console.log(`[EMAIL DISPATCH] Subject: You Won $${prizeAmount} on ImpactPlay!`)
  console.log(`[EMAIL DISPATCH] Body: Congratulations! Your recent golf scores matched the draw numbers. Please log in to upload your proof of score.`)
  return { success: true }
}

export async function sendDrawResultsEmail(email: string, month: string) {
  console.log(`[EMAIL DISPATCH] To: ${email}`)
  console.log(`[EMAIL DISPATCH] Subject: ImpactPlay Draw Results for ${month}`)
  console.log(`[EMAIL DISPATCH] Body: The draw for ${month} is complete! Log in to see if you won.`)
  return { success: true }
}

export async function sendSystemUpdateEmail(email: string, message: string) {
  console.log(`[EMAIL DISPATCH] To: ${email}`)
  console.log(`[EMAIL DISPATCH] Subject: ImpactPlay System Update`)
  console.log(`[EMAIL DISPATCH] Body: ${message}`)
  return { success: true }
}
