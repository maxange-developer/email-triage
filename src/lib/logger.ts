// Lightweight namespaced logger. In production (Vercel) output goes to
// function logs as structured JSON; in development it streams to the
// terminal; in tests (NODE_ENV=test) it is silenced to keep test output
// clean.

const SILENCED = process.env.NODE_ENV === 'test'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogData = Record<string, unknown> | string

function log(level: LogLevel, namespace: string, data: LogData): void {
  if (SILENCED) return
  const payload = typeof data === 'string' ? { message: data } : data
  const entry = { ns: namespace, level, ...payload, t: new Date().toISOString() }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  debug: (ns: string, data: LogData) => log('debug', ns, data),
  info: (ns: string, data: LogData) => log('info', ns, data),
  warn: (ns: string, data: LogData) => log('warn', ns, data),
  error: (ns: string, data: LogData) => log('error', ns, data),
}
