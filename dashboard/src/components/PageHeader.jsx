export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
      <div>
        <h1 style={{
          fontSize: 20,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#5a5a8a', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
