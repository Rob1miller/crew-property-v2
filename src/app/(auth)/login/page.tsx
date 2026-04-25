'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'hsl(var(--color-bg))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'hsl(var(--color-surface))',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid hsl(var(--color-border))',
        padding: '40px',
        boxShadow: 'var(--shadow-md)',
      }}>

        {/* Brand */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            color: 'hsl(var(--color-ink))',
            marginBottom: '4px',
          }}>
            Crew <span style={{ color: 'hsl(var(--color-green-mid))' }}>Property</span>
          </p>
          <p style={{ fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>
            Sign in to your account
          </p>
        </div>

        <form action={formAction}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'hsl(var(--color-ink-muted))', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={{
                display: 'block', width: '100%',
                padding: '10px 12px',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                color: 'hsl(var(--color-ink))',
                background: 'hsl(var(--color-surface))',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'hsl(var(--color-ink-muted))', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                display: 'block', width: '100%',
                padding: '10px 12px',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                color: 'hsl(var(--color-ink))',
                background: 'hsl(var(--color-surface))',
                outline: 'none',
              }}
            />
          </div>

          {state?.error && (
            <p style={{ fontSize: '13px', color: 'hsl(var(--color-red))', marginBottom: '16px' }}>
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              display: 'block', width: '100%',
              padding: '11px',
              background: isPending ? 'hsl(var(--color-surface-muted))' : 'hsl(var(--color-green))',
              color: isPending ? 'hsl(var(--color-ink-subtle))' : 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'hsl(var(--color-ink-subtle))' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'hsl(var(--color-green-mid))', textDecoration: 'none', fontWeight: 500 }}>
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}
