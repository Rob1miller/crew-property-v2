'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null)

  if (state?.success) {
    return (
      <div className="container">
        <h1>Check your email</h1>
        <p>We sent a confirmation link to your email. Click it to activate your account.</p>
        <Link href="/login">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Create account</h1>
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
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Create account'}
        </button>
        {state?.error && <p className="error">{state.error}</p>}
      </form>
      <Link href="/login">Already have an account? Sign in</Link>
    </div>
  )
}
