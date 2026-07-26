const express = require('express');
const router = express.Router();

const BASE_URL =
  process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

function timestamp() {
  return new Date().toISOString().replace(/\D/g, '').slice(0, 14);
}

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

// POST /api/mpesa/stk-push
router.post('/stk-push', async (req, res) => {
  const { phone, amount, accountRef, description } = req.body;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!shortcode || !passkey || !callbackUrl) {
    return res.status(503).json({ error: 'M-Pesa API keys not configured' });
  }

  try {
    const token = await getAccessToken();
    const ts = timestamp();
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');

    const mpesaRes = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: description,
      }),
    });

    const data = await mpesaRes.json();

    if (data.ResponseCode !== '0') {
      return res.status(400).json({
        error: data.ResponseDescription || data.errorMessage || 'STK push failed',
      });
    }

    res.json({ checkoutRequestId: data.CheckoutRequestID });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/mpesa/stk-status?id=...
router.get('/stk-status', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) {
    return res.status(503).json({ error: 'M-Pesa API keys not configured' });
  }

  try {
    const token = await getAccessToken();
    const ts = timestamp();
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');

    const mpesaRes = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        CheckoutRequestID: id,
      }),
    });

    const data = await mpesaRes.json();

    const receipt = data.CallbackMetadata?.Item?.find(
      (i) => i.Name === 'MpesaReceiptNumber'
    )?.Value ?? null;

    res.json({
      resultCode: data.ResultCode?.toString() ?? null,
      mpesaReceiptNumber: receipt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/mpesa/callback  (Safaricom posts here after payment)
router.post('/callback', (req, res) => {
  const body = req.body?.Body?.stkCallback;
  if (body) {
    const code = body.ResultCode;
    const receipt = body.CallbackMetadata?.Item?.find(
      (i) => i.Name === 'MpesaReceiptNumber'
    )?.Value;
    console.log(`M-Pesa callback — ResultCode: ${code}, Receipt: ${receipt ?? 'n/a'}`);
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

module.exports = router;
