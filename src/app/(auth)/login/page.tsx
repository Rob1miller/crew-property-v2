'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="container">
      <h1>Sign in</h1>
      <form action={formAction}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </button>
        {state?.error && <p className="error">{state.error}</p>}
      </form>
      <Link href="/signup">Don't have an account? Sign up</Link>
    </div>
  )
}
