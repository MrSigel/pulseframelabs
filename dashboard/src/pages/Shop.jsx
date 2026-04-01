import { useState } from 'react'
import { Coins, Check, ShoppingCart, Clock, Zap, Crown, CreditCard, ArrowRight, Lock, Copy, X, QrCode } from 'lucide-react'
import { useSubscription, PLANS } from '../context/SubscriptionContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

const COINS = [
  { coin: 'btc', ticker: 'BTC', label: 'Bitcoin' },
  { coin: 'eth', ticker: 'ETH', label: 'Ethereum' },
  { coin: 'ltc', ticker: 'LTC', label: 'Litecoin' },
  { coin: 'usdt/trc20', ticker: 'USDT', label: 'USDT (TRC-20)' },
]

const gold = '#d4af37'

const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
}

export default function Shop() {
  const { t } = useLang()
  const { mode } = useTheme()
  const isDark = mode === 'dark'
  const ts = t.shop
  const tc = t.common
  const { credits, subscription, hasActivePlan, transactions, purchaseCredits, activatePlan } = useSubscription()
  const { user } = useAuth()
  const [activating, setActivating] = useState(null)
  const [activated, setActivated] = useState(null)
  const [buyAmount, setBuyAmount] = useState(null)
  const [selectedCoin, setSelectedCoin] = useState('btc')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [addressCopied, setAddressCopied] = useState(false)

  const handleActivate = async (planKey) => {
    setActivating(planKey)
    const result = await activatePlan(planKey)
    if (!result.error) {
      setActivated(planKey)
      setTimeout(() => setActivated(null), 3000)
    }
    setActivating(null)
  }

  const handleBuy = (amount) => {
    setBuyAmount(amount)
    setShowPayment(true)
    setPaymentData(null)
  }

  const handleCreatePayment = async () => {
    if (!buyAmount || !selectedCoin) return
    setPaymentLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ amount: buyAmount, coin: selectedCoin }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPaymentData(data)
    } catch (err) {
      console.error('Payment error:', err)
      // Fallback: direct credit for testing
      await purchaseCredits(buyAmount)
      setShowPayment(false)
      setBuyAmount(null)
    }
    setPaymentLoading(false)
  }

  const copyAddress = () => {
    if (paymentData?.address_in) {
      navigator.clipboard.writeText(paymentData.address_in)
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000)
    }
  }

  const daysLeft = hasActivePlan ? Math.max(0, Math.ceil((new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24))) : 0

  const planOrder = ['trial', 'monthly', 'quarterly', 'halfyear', 'annual']
  const planPrices = { trial: '€9.90', monthly: '€89', quarterly: '€229', halfyear: '€399', annual: '€699' }
  const planSave = { quarterly: '15%', halfyear: '25%', annual: '35%' }

  return (
    <div>
      {/* Credit Balance */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', marginBottom: 20,
        background: `linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))`,
        border: '1px solid rgba(212,175,55,0.15)', borderRadius: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)',
        }}>
          <Coins size={22} style={{ color: gold }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 4 }}>{ts.creditBalance}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: gold, fontVariantNumeric: 'tabular-nums' }}>{credits.toLocaleString()}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          {hasActivePlan ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Check size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
                {ts[PLANS[subscription.plan_key]?.labelKey] || subscription.plan_key}
              </div>
              <div style={{ fontSize: 10, color: 'var(--label-color)', marginTop: 2 }}>
                {ts.expiresIn} {daysLeft} {ts.days}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#f87171' }}>
              <Lock size={12} /> {ts.noPlan}
            </div>
          )}
        </div>
      </div>

      {/* Active Plan Banner */}
      {hasActivePlan && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', marginBottom: 20,
          background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12,
        }}>
          <Crown size={16} style={{ color: '#34d399' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>
              {ts[PLANS[subscription.plan_key]?.labelKey] || subscription.plan_key} — {ts.activePlan}
            </div>
            <div style={{ fontSize: 11, color: 'var(--label-color)', marginTop: 2 }}>
              {new Date(subscription.started_at).toLocaleDateString()} — {new Date(subscription.expires_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>{daysLeft}d</div>
        </div>
      )}

      {/* Buy Credits */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...S.label, marginBottom: 14 }}>{ts.buyCredits}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { amount: 10,  price: '€9.90' },
            { amount: 100, price: '€89' },
            { amount: 260, price: '€229' },
            { amount: 460, price: '€399' },
            { amount: 800, price: '€699' },
          ].map(pkg => (
            <button key={pkg.amount} onClick={() => handleBuy(pkg.amount)} style={{
              ...S.card, padding: '14px 12px', cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
              borderColor: buyAmount === pkg.amount ? 'rgba(52,211,153,0.4)' : undefined,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,175,55,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                <Coins size={14} style={{ color: gold }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: gold }}>{pkg.amount}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--input-text)' }}>{pkg.price}</div>
              {buyAmount === pkg.amount && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} style={{ color: '#34d399' }} />
                </div>
              )}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 10, color: 'var(--label-color)', marginTop: 8 }}>
          <CreditCard size={10} style={{ verticalAlign: -1, marginRight: 4 }} />
          {ts.payWithCrypto || 'Pay with BTC, ETH, LTC, USDT'}
        </p>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        }} onClick={() => { if (!paymentData) { setShowPayment(false) } }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 400, padding: 28, borderRadius: 16,
            background: isDark ? 'rgba(10,10,22,0.96)' : '#ffffff',
            border: `1px solid rgba(212,175,55,0.3)`,
            boxShadow: `0 16px 60px rgba(0,0,0,0.6)`,
          }}>
            {!paymentData ? (
              <>
                {/* Step 1: Select coin */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--input-text)' }}>{ts.buyCredits}</div>
                    <div style={{ fontSize: 12, color: 'var(--label-color)', marginTop: 2 }}>
                      {buyAmount} Credits — €{buyAmount === 10 ? '9.90' : buyAmount === 100 ? '89' : buyAmount === 260 ? '229' : buyAmount === 460 ? '399' : '699'}
                    </div>
                  </div>
                  <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', color: 'var(--label-color)', cursor: 'pointer' }}><X size={18} /></button>
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 10 }}>
                  {ts.selectCoin || 'Select Cryptocurrency'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {COINS.map(c => (
                    <button key={c.coin} onClick={() => setSelectedCoin(c.coin)} style={{
                      padding: '12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      background: selectedCoin === c.coin ? 'rgba(212,175,55,0.1)' : 'var(--input-bg)',
                      border: `1px solid ${selectedCoin === c.coin ? 'rgba(212,175,55,0.4)' : 'var(--card-border)'}`,
                      color: selectedCoin === c.coin ? gold : 'var(--input-text)', transition: 'all 0.15s',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{c.ticker}</div>
                      <div style={{ fontSize: 10, color: 'var(--label-color)', marginTop: 2 }}>{c.label}</div>
                    </button>
                  ))}
                </div>

                <button onClick={handleCreatePayment} disabled={paymentLoading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: `linear-gradient(135deg, ${gold}, #b8962e)`, border: 'none',
                  color: '#000', cursor: paymentLoading ? 'wait' : 'pointer',
                }}>
                  {paymentLoading ? <Clock size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
                  {paymentLoading ? (ts.generating || 'Generating address...') : (ts.generateAddress || 'Generate Payment Address')}
                </button>
              </>
            ) : (
              <>
                {/* Step 2: Show address + QR */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--input-text)' }}>
                    {ts.sendPayment || 'Send Payment'}
                  </div>
                  <button onClick={() => { setShowPayment(false); setPaymentData(null) }} style={{ background: 'none', border: 'none', color: 'var(--label-color)', cursor: 'pointer' }}><X size={18} /></button>
                </div>

                {/* Amount info */}
                <div style={{
                  padding: '16px 14px', borderRadius: 10, marginBottom: 16,
                  background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--label-color)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {ts.amountToPay || 'Amount to pay'}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: gold, fontFamily: 'monospace' }}>
                    {paymentData.amount_crypto} {COINS.find(c => c.coin === paymentData.coin)?.ticker || ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--label-color)', marginTop: 4 }}>
                    ≈ €{paymentData.amount_fiat}
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  {paymentData.qr_code ? (
                    <img src={paymentData.qr_code} alt="QR Code" style={{
                      width: 200, height: 200, borderRadius: 12, border: '1px solid var(--card-border)',
                      background: '#fff', padding: 10,
                    }} />
                  ) : (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.payment_uri || paymentData.address_in)}`}
                      alt="QR Code" style={{
                        width: 200, height: 200, borderRadius: 12, border: '1px solid var(--card-border)',
                        background: '#fff', padding: 10,
                      }} />
                  )}
                </div>

                {/* Address */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--label-color)', marginBottom: 6 }}>
                    {ts.sendTo || 'Send to this address'}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderRadius: 8,
                    background: 'var(--input-bg)', border: '1px solid var(--card-border)',
                  }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--input-text)', flex: 1, wordBreak: 'break-all', lineHeight: 1.4 }}>
                      {paymentData.address_in}
                    </span>
                    <button onClick={copyAddress} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6,
                      fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      background: addressCopied ? 'rgba(52,211,153,0.15)' : 'rgba(212,175,55,0.1)',
                      border: `1px solid ${addressCopied ? 'rgba(52,211,153,0.4)' : 'rgba(212,175,55,0.25)'}`,
                      color: addressCopied ? '#34d399' : gold, flexShrink: 0,
                    }}>
                      {addressCopied ? <Check size={10} /> : <Copy size={10} />}
                      {addressCopied ? (ts.copiedLabel || 'Copied') : (ts.copyLabel || 'Copy')}
                    </button>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>
                    <Clock size={11} style={{ verticalAlign: -2, marginRight: 4 }} />
                    {ts.waitingPayment || 'Waiting for payment confirmation...'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--label-color)', marginTop: 4 }}>
                    {ts.autoCredit || 'Credits will be added automatically after confirmation.'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ ...S.label, marginBottom: 14 }}>{ts.plans}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {planOrder.map(key => {
            const plan = PLANS[key]
            const isActive = hasActivePlan && subscription.plan_key === key
            const canAfford = credits >= plan.credits
            const isPopular = key === 'quarterly'

            return (
              <div key={key} style={{
                ...S.card, padding: '18px 16px', position: 'relative', overflow: 'hidden',
                borderColor: isActive ? 'rgba(52,211,153,0.3)' : isPopular ? 'rgba(212,175,55,0.25)' : undefined,
                background: isActive ? 'rgba(52,211,153,0.04)' : isPopular ? 'rgba(212,175,55,0.03)' : undefined,
              }}>
                {isPopular && !isActive && (
                  <div style={{
                    position: 'absolute', top: 8, right: -24, background: gold, color: '#000',
                    fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    padding: '2px 28px', transform: 'rotate(45deg)',
                  }}>Popular</div>
                )}

                <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#34d399' : 'var(--input-text)', marginBottom: 4 }}>
                  {ts[plan.labelKey]}
                </div>
                <div style={{ fontSize: 10, color: 'var(--label-color)', marginBottom: 12 }}>
                  {ts[plan.labelKey + 'Desc']} • {planPrices[key]}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                  <Coins size={13} style={{ color: gold }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: gold }}>{plan.credits}</span>
                  <span style={{ fontSize: 10, color: 'var(--label-color)' }}>{ts.credits}</span>
                  {planSave[key] && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#34d399', marginLeft: 'auto', padding: '2px 6px', borderRadius: 4, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                      -{planSave[key]}
                    </span>
                  )}
                </div>

                {isActive ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: 8, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', fontSize: 11, fontWeight: 700, color: '#34d399' }}>
                    <Check size={12} /> {ts.activated}
                  </div>
                ) : (
                  <button onClick={() => handleActivate(key)}
                    disabled={!canAfford || activating === key || hasActivePlan}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      width: '100%', padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: canAfford && !hasActivePlan ? `linear-gradient(135deg, ${gold}, #b8962e)` : isDark ? '#1a1818' : '#d8d4cc',
                      border: 'none', color: canAfford && !hasActivePlan ? '#000' : '#666',
                      cursor: canAfford && !hasActivePlan ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (canAfford && !hasActivePlan) { e.currentTarget.style.boxShadow = `0 0 18px rgba(212,175,55,0.3)`; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                    {activating === key ? <Clock size={12} /> : activated === key ? <Check size={12} /> : <Zap size={12} />}
                    {!canAfford ? ts.insufficientCredits : hasActivePlan ? ts.activePlan : activated === key ? ts.activated : ts.activate}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div>
          <p style={{ ...S.label, marginBottom: 14 }}>{ts.transactionHistory}</p>
          <div style={{ ...S.card, padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(212,175,55,0.04)' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: tx.amount > 0 ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                    border: `1px solid ${tx.amount > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                  }}>
                    {tx.amount > 0 ? <ArrowRight size={10} style={{ color: '#34d399', transform: 'rotate(-45deg)' }} /> : <ArrowRight size={10} style={{ color: '#fbbf24', transform: 'rotate(135deg)' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--input-text)' }}>
                      {tx.type === 'purchase' ? ts.purchase : ts.planActivation}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--label-color)' }}>
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tx.amount > 0 ? '#34d399' : '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
