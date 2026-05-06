// In-memory active account store — mock mode only
let _activeAccountId = 'account-001'

export const getActiveAccountId = () => _activeAccountId
export const setActiveAccountId = (id: string) => {
  _activeAccountId = id
}
