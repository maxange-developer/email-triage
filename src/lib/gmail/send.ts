import { getGmailClient } from './client'

export interface SendEmailParams {
  to: string
  subject: string
  body: string
  threadId?: string | null
  /** Original message ID (RFC 5322 Message-ID) for threading. */
  inReplyTo?: string | null
}

function buildMime(params: SendEmailParams): string {
  const lines = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
  ]

  if (params.inReplyTo) {
    const normalizedId = params.inReplyTo.startsWith('<')
      ? params.inReplyTo
      : `<${params.inReplyTo}>`
    lines.push(`In-Reply-To: ${normalizedId}`)
    lines.push(`References: ${normalizedId}`)
  }

  lines.push('', params.body)
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
