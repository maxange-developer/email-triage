export interface GmailAccount {
  id: string
  userId: string
  emailAddress: string
  displayName?: string | null
  isPrimary: boolean
  createdAt: string
}
