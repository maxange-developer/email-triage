import { getGmailClient } from './client'

export interface SendEmailParams {
  to: string
  subject: string
  body: string
  threadId?: string | null
}

function buildMime(params: SendEmailParams): string {
  const subject = params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`
  const lines = [
    `To: ${params.to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    params.body,
  ]
  return Buffer.from(lines.join('\r\n')).toString('base64url')
}

export async function sendEmail(
  accessToken: string,
  params: SendEmailParams,
): Promise<void> {
  const gmail = getGmailClient(accessToken)
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: buildMime(params),
      ...(params.threadId ? { threadId: params.threadId } : {}),
    },
  })
}
