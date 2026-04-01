import express from 'express'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 10000

// ── Supabase Admin Client ──────────────────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// ── CryptAPI Config ────────────────────────────────────────────────────
const CRYPTAPI_BASE = 'https://api.cryptapi.io'
const WEBHOOK_SECRET = process.env.CRYPTAPI_WEBHOOK_SECRET || 'pfl-webhook-secret-2026'
const SITE_URL = process.env.SITE_URL || 'https://pulseframelabs.com'

const RECEIVING_ADDRESSES = {
  btc:        process.env.CRYPTAPI_ADDRESS_BTC || '',
  eth:        process.env.CRYPTAPI_ADDRESS_ETH || '',
  ltc:        process.env.CRYPTAPI_ADDRESS_LTC || '',
  'usdt/erc20': process.env.CRYPTAPI_ADDRESS_USDT_ERC20 || '',
  'usdt/trc20': process.env.CRYPTAPI_ADDRESS_USDT_TRC20 || '',
  'usdt/bep20': process.env.CRYPTAPI_ADDRESS_USDT_BEP20 || '',
}

function generateSignature(paymentId) {
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(paymentId).digest('hex')
}

function verifySignature(paymentId, signature) {
  const expected = generateSignature(paymentId)
  return signature === expected
}

app.use(express.json())

// ── API: Create Top-Up Payment ─────────────────────────────────────────
app.post('/api/wallet/topup', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Server not configured' })

    // Verify auth token from header
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' })

    const { amount, coin } = req.body
    if (!amount || amount < 5) return res.status(400).json({ error: 'Minimum 5 credits' })

    const addressOut = RECEIVING_ADDRESSES[coin]
    if (!addressOut) return res.status(400).json({ error: 'Unsupported coin or address not configured' })

    // Create payment request in DB
    const { data: payment, error: insertErr } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.id, coin, amount_fiat: amount,
        address_out: addressOut, callback_url: `${SITE_URL}/api/cryptapi/webhook`,
        credits_to_add: amount, status: 'pending',
      })
      .select().single()

    if (insertErr) throw insertErr

    // Build callback URL with HMAC
    const sig = generateSignature(payment.id)
    const callbackUrl = `${SITE_URL}/api/cryptapi/webhook?payment_id=${payment.id}&sig=${sig}`

    // Call CryptAPI to create address
    const createUrl = `${CRYPTAPI_BASE}/${coin}/create/?callback=${encodeURIComponent(callbackUrl)}&address=${addressOut}&pending=1`
    const createRes = await fetch(createUrl)
    const createData = await createRes.json()
    if (createData.status !== 'success') throw new Error(createData.error || 'CryptAPI error')

    // Convert EUR to crypto
    const convertUrl = `${CRYPTAPI_BASE}/${coin}/convert/?value=${amount}&from=eur`
    const convertRes = await fetch(convertUrl)
    const convertData = await convertRes.json()
    const cryptoAmount = convertData.status === 'success' ? convertData.value_coin : '?'

    // Get QR code
    const qrUrl = `${CRYPTAPI_BASE}/${coin}/qrcode/?address=${createData.address_in}&value=${cryptoAmount}&size=300`
    const qrRes = await fetch(qrUrl)
    const qrData = await qrRes.json()

    // Update payment with address
    await supabase.from('payment_requests').update({
      address_in: createData.address_in,
      amount_crypto: cryptoAmount,
      callback_url: callbackUrl,
    }).eq('id', payment.id)

    res.json({
      payment_id: payment.id,
      address_in: createData.address_in,
      amount_crypto: cryptoAmount,
      amount_fiat: amount,
      coin,
      qr_code: qrData.qr_code || '',
      payment_uri: qrData.payment_uri || '',
    })
  } catch (err) {
    console.error('Topup error:', err)
    res.status(500).json({ error: err.message || 'Top-up failed' })
  }
})

// ── API: CryptAPI Webhook ──────────────────────────────────────────────
app.all('/api/cryptapi/webhook', async (req, res) => {
  try {
    if (!supabase) return res.send('*ok*')

    const paymentId = req.query.payment_id
    const signature = req.query.sig

    if (!paymentId) return res.send('*ok*')
    if (!signature || !verifySignature(paymentId, signature)) {
      console.warn('Invalid webhook signature for:', paymentId)
      return res.send('*ok*')
    }

    const txid = req.query.txid_in || ''
    const confirmations = parseInt(req.query.confirmations || '0', 10)
    const pending = req.query.pending === '1'

    // Get payment
    const { data: payment } = await supabase
      .from('payment_requests').select('*').eq('id', paymentId).single()

    if (!payment || payment.status === 'completed') return res.send('*ok*')

    if (pending) {
      await supabase.from('payment_requests').update({
        status: 'confirming', txid, confirmations,
      }).eq('id', paymentId)
      return res.send('*ok*')
    }

    // Payment confirmed — credit wallet
    await supabase.from('payment_requests').update({
      status: 'completed', txid, confirmations,
    }).eq('id', paymentId)

    // Credit user atomically
    const { error: creditErr } = await supabase.rpc('credit_wallet', {
      p_user_id: payment.user_id,
      p_amount: payment.credits_to_add,
      p_description: `Crypto top-up via ${payment.coin} (${payment.amount_fiat} EUR)`,
      p_reference_id: payment.id,
    })

    if (creditErr) {
      console.error('Credit error:', creditErr)
      await supabase.from('payment_requests').update({
        status: 'failed',
      }).eq('id', paymentId)
    }

    res.send('*ok*')
  } catch (err) {
    console.error('Webhook error:', err)
    res.send('*ok*')
  }
})

// ── Serve Vite Build ───────────────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback — all routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pulseframelabs server running on port ${PORT}`)
})
