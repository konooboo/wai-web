import { useState, type FormEvent } from 'react'
import { Koru } from '../components/Koru'

// The mobile app's sign-in screen (wai/src/app/login/page.tsx), same markup
// and classes. There is no auth behind it: every attempt fails.
export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setTimeout(() => {
      setError('Wrong email or password.')
      setBusy(false)
    }, 600)
  }

  const input =
    'w-full rounded-2xl border border-line bg-white px-4 py-3 text-[16px] outline-none focus:border-ink'
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <a
        href="/"
        aria-label="Wai"
        className="font-logo flex items-center gap-2 text-[28px] leading-none font-semibold tracking-tight [font-stretch:125%]"
      >
        <Koru className="size-6" />
        wai
      </a>
      <p className="text-muted mt-3">
        Know your soil and water without the walk.
      </p>
      <form onSubmit={submit} className="mt-10 flex flex-col gap-3">
        <div className="text-muted font-mono text-xs tracking-wider uppercase">
          Email
        </div>
        <input
          className={input}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="text-muted mt-2 font-mono text-xs tracking-wider uppercase">
          Password
        </div>
        <input
          className={input}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-alert text-[14px]">{error}</p>}
        <button
          disabled={busy}
          className="bg-ink text-paper hover:bg-ink/85 mt-4 rounded-full px-6 py-3 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
