import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Crew Property — UK landlord management' }

export default function HomePage() {
  return (
    <main style={{
      background: 'linear-gradient(180deg, #0B1F3A 0%, #0E2A4D 100%)',
      color: '#E6EDF5',
      fontFamily: '"Inter", system-ui, sans-serif',
      minHeight: '100vh',
    }}>

      {/* Nav */}
      <nav style={{
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>
          Crew Property
        </span>
        <a href="/login" style={{ fontSize: '14px', color: '#9FB3C8', textDecoration: 'none' }}>
          Login
        </a>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '140px 40px 120px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#7FA6D6', textTransform: 'uppercase', marginBottom: '30px' }}>
          Property Control System
        </p>
        <h1 style={{ fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 700, lineHeight: 1.05, margin: '0 0 28px', maxWidth: '760px' }}>
          Full control of every<br />property, every risk.
        </h1>
        <p style={{ fontSize: '18px', color: '#B7C8DA', maxWidth: '620px', lineHeight: 1.7, margin: '0 0 20px' }}>
          Compliance tracking, EPC planning, and clear decision support for UK landlords.
        </p>
        <p style={{ fontSize: '15px', color: '#8FA9C4', maxWidth: '640px', lineHeight: 1.7, margin: '0 0 40px' }}>
          Built to help landlords stay compliant, avoid expensive mistakes, and make better decisions across their portfolio.
        </p>
        <a href="/login" style={{
          display: 'inline-block', padding: '16px 34px',
          backgroundColor: '#4DA3FF', color: '#ffffff',
          textDecoration: 'none', fontSize: '14px', fontWeight: 600,
          borderRadius: '8px', boxShadow: '0 10px 30px rgba(77,163,255,0.25)',
        }}>
          Access your portfolio →
        </a>
      </section>

      {/* Problem */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontSize: '30px', margin: '0 0 34px' }}>Most landlords are reacting, not planning.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
          {['Compliance requirements are increasing','EPC rules are changing','Costs are unpredictable','Mistakes are expensive'].map(item => (
            <div key={item} style={{ padding: '22px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', color: '#B7C8DA', lineHeight: 1.6 }}>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontSize: '30px', margin: '0 0 40px' }}>A system designed to stay ahead.</h2>
        <div style={{ display: 'grid', gap: '18px' }}>
          {[
            { title: 'Track compliance across all properties', description: 'Keep certificates, deadlines, and legal requirements in one place.' },
            { title: 'Plan EPC upgrades before deadlines', description: 'Understand what needs doing, when it matters, and where risk sits.' },
            { title: 'Understand future costs', description: 'Get clearer visibility over maintenance, upgrades, and portfolio decisions.' },
            { title: 'Maintain a complete property record', description: 'Keep a clean history of actions, documents, and decisions across the portfolio.' },
          ].map(item => (
            <div key={item.title} style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>{item.title}</div>
              <div style={{ color: '#B7C8DA', lineHeight: 1.7, fontSize: '15px' }}>{item.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#7FA6D6', textTransform: 'uppercase', marginBottom: '18px' }}>Advisory Service</p>
        <h2 style={{ fontSize: '30px', margin: '0 0 18px' }}>Start with a compliance audit.</h2>
        <p style={{ color: '#B7C8DA', lineHeight: 1.7, margin: '0 0 36px', fontSize: '16px', maxWidth: '620px' }}>
          A fixed-fee review of your portfolio's compliance position. Clear findings, prioritised actions, and a practical next-step plan.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7FA6D6', marginBottom: '12px' }}>Report only</div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '18px' }}>£99</div>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#B7C8DA', lineHeight: 1.8 }}>
              <li>Fixed-fee compliance review</li>
              <li>Clear written risk report</li>
              <li>Prioritised action plan</li>
            </ul>
          </div>
          <div style={{ padding: '28px', borderRadius: '12px', border: '1px solid rgba(77,163,255,0.35)', background: 'rgba(77,163,255,0.08)' }}>
            <div style={{ fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9FD0FF', marginBottom: '12px' }}>Report + call</div>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '18px' }}>£149</div>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#D5E5F5', lineHeight: 1.8 }}>
              <li>Everything in the report option</li>
              <li>15-minute follow-up call</li>
              <li>Clear answers on next steps</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '90px 40px 120px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '36px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 16px' }}>Get started with Crew Property.</h2>
          <p style={{ color: '#B7C8DA', lineHeight: 1.7, margin: '0 0 28px', maxWidth: '620px', fontSize: '16px' }}>
            Access your portfolio, review your properties, and stay ahead of risk.
          </p>
          <a href="/login" style={{
            display: 'inline-block', padding: '16px 34px',
            backgroundColor: '#4DA3FF', color: '#ffffff',
            textDecoration: 'none', fontSize: '14px', fontWeight: 600,
            borderRadius: '8px', boxShadow: '0 10px 30px rgba(77,163,255,0.25)',
          }}>
            Log in to Crew Property →
          </a>
        </div>
      </section>

    </main>
  )
}
