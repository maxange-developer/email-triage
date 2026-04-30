import { google } from 'googleapis'
import type { gmail_v1 } from 'googleapis'

export type GmailMessage = gmail_v1.Schema$Message
export type GmailThread = gmail_v1.Schema$Thread

export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ access_token: accessToken })
  return google.gmail({ version: 'v1', auth })
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: number }> {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ refresh_token: refreshToken })
  const { credentials } = await auth.refreshAccessToken()
  return {
    accessToken: credentials.access_token!,
    expiresAt: credentials.expiry_date ?? Date.now() + 3_600_000,
  }
}
