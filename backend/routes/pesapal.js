const express = require('express');
const router = express.Router();

const BASE_URL =
  process.env.PESAPAL_ENVIRONMENT === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

async function getAccessToken() {
  const res = await fetch(`${BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`Pesapal auth failed: ${res.status}`);
  const data = await res.json();
  if (!data.token) throw new Error(data.message || 'No token returned');
  return data.token;
}

async function getOrRegisterIpnId(token) {
  const ipnUrl = process.env.PESAPAL_IPN_URL;
  const res = await fetch(`${BASE_URL}/api/Transactions/RegisterIPN`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' }),
  });
  if (!res.ok) throw new Error(`IPN registration failed: ${res.status}`);
  const data = await res.json();
  if (!data.ipn_id) throw new Error(data.message || 'No IPN ID returned');
  return data.ipn_id;
}

// POST /api/pesapal/create-order
router.post('/create-order', async (req, res) => {
  const { amount, category, firstName, lastName, email, phone, recurring } = req.body;

  if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
    return res.status(503).json({ error: 'Pesapal API keys not configured' });
  }

  try {
    const token = await getAccessToken();
    const ipnId = await getOrRegisterIpnId(token);
    const merchantReference = `ACK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const iframeCallbackUrl = `${frontendUrl}/api/pesapal/iframe-return`;

    const orderRes = await fetch(`${BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        id: merchantReference,
        currency: 'KES',
        amount: Math.round(amount),
        description: `ACK Cathedral — ${category}`,
        callback_url: iframeCallbackUrl,
        notification_id: ipnId,
        ...(recurring && { subscription_details: { frequency: 'MONTHLY', start_date: new Date().toISOString().split('T')[0] } }),
        billing_address: {
          email_address: email || '',
          phone_number: phone || '',
          first_name: firstName || '',
          last_name: lastName || '',
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderData.redirect_url) {
      return res.status(400).json({ error: orderData.message || 'No redirect URL returned' });
    }

    res.json({
      redirectUrl: orderData.redirect_url,
      orderTrackingId: orderData.order_tracking_id,
      merchantReference,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/pesapal/status?trackingId=...
router.get('/status', async (req, res) => {
  const { trackingId } = req.query;
  if (!trackingId) return res.status(400).json({ error: 'Missing trackingId' });

  try {
    const token = await getAccessToken();

    const statusRes = await fetch(
      `${BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    const data = await statusRes.json();

    res.json({
      status: data.payment_status_description ?? null,
      confirmationCode: data.confirmation_code ?? null,
      amount: data.amount ?? null,
      paymentMethod: data.payment_method ?? null,
      message: data.message ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/pesapal/ipn  (Pesapal notifies here)
router.get('/ipn', async (req, res) => {
  const { orderTrackingId, orderMerchantReference, orderNotificationType } = req.query;
  console.log(`Pesapal IPN — ref: ${orderMerchantReference}, tracking: ${orderTrackingId}, type: ${orderNotificationType}`);
  res.json({ orderNotificationType, orderTrackingId, orderMerchantReference, status: '200' });
});

module.exports = router;
