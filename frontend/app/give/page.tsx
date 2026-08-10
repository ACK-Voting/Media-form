'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { useGivingStore } from '@/stores/cms/givingStore';

const amounts = [500, 1000, 2000, 5000, 10000];

// Daraja AccountReference max 12 chars, alphanumeric only
const categoryAccountMap: Record<string, string> = {
  tithe: 'Tithe',
  offering: 'Offering',
  building: 'BuildingFund',
  missions: 'Missions',
  benevolence: 'Benevolence',
  youth: 'YouthFund',
};

type StkState = 'idle' | 'sending' | 'waiting' | 'success' | 'failed';

const STK_TIMEOUT_SECONDS = 90;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  return digits;
}

function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return (
    (digits.startsWith('07') && digits.length === 10) ||
    (digits.startsWith('01') && digits.length === 10) ||
    (digits.startsWith('2547') && digits.length === 12) ||
    (digits.startsWith('2541') && digits.length === 12)
  );
}

function GivePage() {
  const givingInfo = useGivingStore((s) => s.givingInfo);
  const [method, setMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [category, setCategory] = useState('tithe');
  const [recurring, setRecurring] = useState(false);

  // M-Pesa state
  const [phone, setPhone] = useState('');
  const [stkState, setStkState] = useState<StkState>('idle');
  const [phoneError, setPhoneError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);

  // Card / Pesapal state
  const [cardFirstName, setCardFirstName] = useState('');
  const [cardLastName, setCardLastName] = useState('');
  const [cardEmail, setCardEmail] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Pesapal return state
  const searchParams = useSearchParams();
  const [pesapalReturn, setPesapalReturn] = useState<'success' | 'failed' | 'pending' | null>(null);
  const [pesapalConfirmation, setPesapalConfirmation] = useState<string | null>(null);

  const finalAmount = amount !== '' ? amount : customAmount ? parseInt(customAmount) : 0;

  // Countdown while waiting for M-Pesa PIN
  useEffect(() => {
    if (stkState !== 'waiting') { setWaitSeconds(0); return; }
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setWaitSeconds(elapsed);
      if (elapsed >= STK_TIMEOUT_SECONDS) {
        clearInterval(tick);
        setStkState('failed');
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [stkState]);

  // Poll for M-Pesa confirmation
  useEffect(() => {
    if (stkState !== 'waiting' || !checkoutRequestId) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/mpesa/stk-status?id=${encodeURIComponent(checkoutRequestId)}`);
        const data = await res.json();
        if (data.resultCode === '0') {
          setMpesaReceipt(data.mpesaReceiptNumber ?? null);
          setStkState('success');
        } else if (data.resultCode !== undefined && data.resultCode !== null) {
          setStkState('failed');
        }
      } catch { /* keep waiting */ }
    }, 3000);
    return () => clearInterval(poll);
  }, [stkState, checkoutRequestId]);

  const handleStkPush = async () => {
    if (!isValidPhone(phone)) {
      setPhoneError('Please enter a valid Safaricom number e.g. 0712 345 678');
      return;
    }
    if (finalAmount < 10) return;
    setPhoneError('');
    setStkState('sending');
    try {
      const res = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatPhone(phone),
          amount: finalAmount,
          accountRef: categoryAccountMap[category] ?? 'Offering',
          description: 'ACK Donation',
        }),
      });
      const ct = res.headers.get('content-type') ?? '';
      const data = ct.includes('application/json') ? await res.json() : {};
      if (!res.ok) throw new Error(data.error ?? `Server error (${res.status})`);
      setCheckoutRequestId(data.checkoutRequestId ?? null);
      setStkState('waiting');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setPhoneError(msg);
      setStkState('idle');
    }
  };

  const checkPesapalStatus = useCallback(async (trackingId: string) => {
    try {
      const res = await fetch(`/api/pesapal/status?trackingId=${encodeURIComponent(trackingId)}`);
      const data = await res.json();
      const s = (data.status ?? '').toLowerCase();
      setIframeUrl(null);
      if (s === 'completed') {
        setPesapalConfirmation(data.confirmationCode ?? null);
        setPesapalReturn('success');
      } else if (s === 'failed' || s === 'invalid') {
        setPesapalReturn('failed');
      } else {
        setPesapalReturn('pending');
      }
    } catch {
      setIframeUrl(null);
      setPesapalReturn('pending');
    }
  }, []);

  // Listen for postMessage from the Pesapal iframe return page
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'pesapal-return' && e.data.trackingId) {
        checkPesapalStatus(e.data.trackingId);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [checkPesapalStatus]);

  // Handle legacy redirect-back (in case iframe postMessage fails)
  useEffect(() => {
    const trackingId = searchParams.get('OrderTrackingId');
    if (trackingId) {
      setMethod('card');
      checkPesapalStatus(trackingId);
    }
  }, [searchParams, checkPesapalStatus]);

  const handleCardPay = async () => {
    if (finalAmount < 10) return;
    setCardLoading(true);
    setCardError('');
    try {
      const res = await fetch('/api/pesapal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          category: givingInfo.givingCategories.find((c) => c.id === category)?.label ?? 'Offering',
          recurring,
          firstName: cardFirstName,
          lastName: cardLastName,
          email: cardEmail,
        }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        setIframeUrl(data.redirectUrl);
        setIframeLoaded(false);
      } else {
        throw new Error(data.error ?? 'No checkout URL returned');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Card payment unavailable';
      setCardError(msg);
    } finally {
      setCardLoading(false);
    }
  };

  const resetStk = () => {
    setStkState('idle');
    setCheckoutRequestId(null);
    setMpesaReceipt(null);
    setWaitSeconds(0);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/Background.jpeg')" }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            GENEROSITY &amp; GIVING
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Give to the Cathedral</h1>
          <p className="text-lg text-amber-200 max-w-2xl mx-auto">
            &quot;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion,
            for God loves a cheerful giver.&quot; — 2 Corinthians 9:7
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Giving Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Gift</h2>

                {/* Giving Category */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Giving Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {givingInfo.givingCategories.map(cat => (
                      <button key={cat.id} onClick={() => setCategory(cat.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all text-sm ${category === cat.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <p className="font-semibold text-gray-900">{cat.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Amount (KES)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {amounts.map(a => (
                      <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }}
                        className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${amount === a ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                        KES {a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">KES</span>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={e => { setCustomAmount(e.target.value); setAmount(''); }}
                      className="w-full border-2 border-gray-200 rounded-xl pl-14 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Recurring */}
                <div className="mb-6">
                  <button onClick={() => {
                    const next = !recurring;
                    setRecurring(next);
                    if (next) { setMethod('card'); resetStk(); }
                  }}
                    className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all ${recurring ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${recurring ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {recurring && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Make this a recurring gift</p>
                      <p className="text-xs text-gray-500">Monthly automatic deduction — requires a card</p>
                    </div>
                    {recurring && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full flex-shrink-0">Card only</span>
                    )}
                  </button>
                  {recurring && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1.5 pl-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recurring gifts use card subscription billing. M-PESA is one-time only.
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                  <div className="flex gap-3">
                    {([
                      { id: 'mpesa', label: 'M-PESA', icon: '📱' },
                      { id: 'card', label: 'Card', icon: '💳' },
                    ] as const).map(m => {
                      const disabled = recurring && m.id !== 'card';
                      return (
                        <button key={m.id}
                          onClick={() => { if (!disabled) { setMethod(m.id); resetStk(); } }}
                          disabled={disabled}
                          title={disabled ? 'Recurring gifts require a card' : undefined}
                          className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 font-semibold text-sm transition-all
                            ${method === m.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}
                            ${disabled ? 'opacity-40 cursor-not-allowed hover:border-gray-200' : ''}`}>
                          <span className="text-xl">{m.icon}</span>
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── M-PESA STK PUSH ── */}
                {method === 'mpesa' && (
                  <div className="mb-6">

                    {stkState === 'idle' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📱</span>
                          <div>
                            <h3 className="font-bold text-green-900">M-PESA STK Push</h3>
                            <p className="text-xs text-green-700">We&apos;ll send a payment prompt directly to your phone</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-green-900 mb-1.5">Safaricom Phone Number</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700 font-semibold text-sm">🇰🇪</span>
                            <input
                              type="tel"
                              placeholder="07XX XXX XXX"
                              value={phone}
                              onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                              className="w-full border-2 border-green-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white transition-colors"
                            />
                          </div>
                          {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                        </div>

                        {finalAmount > 0 && (
                          <div className="bg-white border border-green-200 rounded-xl p-4 text-sm space-y-2">
                            <div className="flex justify-between text-gray-600">
                              <span>Paybill</span>
                              <span className="font-semibold text-gray-900">{givingInfo.mpesa.paybill}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Account No.</span>
                              <span className="font-semibold text-gray-900">{categoryAccountMap[category] ?? 'Offering'}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Phone</span>
                              <span className="font-semibold text-gray-900">{phone || '—'}</span>
                            </div>
                            <div className="flex justify-between border-t border-green-100 pt-2">
                              <span className="font-bold text-gray-900">Total</span>
                              <span className="font-bold text-green-700 text-base">KES {finalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleStkPush}
                          disabled={finalAmount < 10}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-base transition-all hover:shadow-lg flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          {finalAmount > 0 ? `Send STK Push — KES ${finalAmount.toLocaleString()}` : 'Select an amount to continue'}
                        </button>

                        <p className="text-xs text-green-700 text-center">
                          Paybill: <strong>{givingInfo.mpesa.paybill}</strong> · Account No: <strong>{categoryAccountMap[category] ?? 'Offering'}</strong>
                        </p>
                      </div>
                    )}

                    {stkState === 'sending' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-green-900 text-lg">Sending request…</p>
                          <p className="text-sm text-green-700 mt-1">Contacting M-PESA servers</p>
                        </div>
                      </div>
                    )}

                    {stkState === 'waiting' && (
                      <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 flex flex-col items-center text-center gap-5">
                        <div className="relative">
                          <div className="w-20 h-32 bg-gray-900 rounded-2xl border-4 border-gray-700 flex flex-col items-center justify-center shadow-xl">
                            <div className="w-12 h-16 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-green-400 text-[8px] font-bold leading-tight">M-PESA</p>
                                <p className="text-white text-[7px] mt-1 leading-tight">KES {finalAmount.toLocaleString()}</p>
                                <p className="text-green-300 text-[6px] mt-0.5">Enter PIN</p>
                              </div>
                            </div>
                          </div>
                          <span className="absolute -top-2 -right-2 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-green-900 text-lg">Check your phone!</p>
                          <p className="text-sm text-green-800 mt-1">
                            An M-PESA prompt has been sent to <strong>{phone}</strong>
                          </p>
                          <p className="text-sm text-green-700 mt-1">Enter your M-PESA PIN to complete the payment.</p>
                        </div>

                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((waitSeconds / STK_TIMEOUT_SECONDS) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-green-600">Waiting for confirmation… ({STK_TIMEOUT_SECONDS - waitSeconds}s)</p>

                        <button onClick={resetStk} className="text-xs text-green-700 underline hover:text-green-900">
                          Cancel &amp; try again
                        </button>
                      </div>
                    )}

                    {stkState === 'success' && (
                      <div className="bg-white border-2 border-green-500 rounded-xl overflow-hidden">
                        <div className="bg-green-600 text-white p-5 text-center">
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="font-bold text-xl">Payment Successful!</p>
                          <p className="text-green-100 text-sm mt-1">Thank you for your generosity</p>
                        </div>

                        <div className="p-5 space-y-3 text-sm">
                          {[
                            { label: 'M-PESA Receipt', value: mpesaReceipt ?? '—' },
                            { label: 'Phone', value: phone },
                            { label: 'Category', value: givingInfo.givingCategories.find(c => c.id === category)?.label ?? '' },
                            { label: 'Amount', value: `KES ${finalAmount.toLocaleString()}` },
                            { label: 'Date', value: new Date().toLocaleDateString('en-KE', { dateStyle: 'long' }) },
                            { label: 'Status', value: 'Confirmed' },
                          ].map(row => (
                            <div key={row.label} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
                              <span className="text-gray-500">{row.label}</span>
                              <span className={`font-semibold ${row.label === 'Status' ? 'text-green-600' : 'text-gray-900'}`}>{row.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="px-5 pb-5 space-y-2">
                          <p className="text-xs text-center text-gray-500">A confirmation SMS has been sent to your phone.</p>
                          <button onClick={resetStk}
                            className="w-full border-2 border-green-500 text-green-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors">
                            Give Again
                          </button>
                        </div>
                      </div>
                    )}

                    {stkState === 'failed' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-red-900">Payment failed or timed out</p>
                          <p className="text-sm text-red-700 mt-1">The request was cancelled or the PIN was not entered in time.</p>
                        </div>
                        <button onClick={resetStk}
                          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── CARD (Pesapal) ── */}
                {method === 'card' && (
                  <div className="space-y-4 mb-6">

                    {/* Return: success */}
                    {pesapalReturn === 'success' && (
                      <div className="bg-white border-2 border-green-500 rounded-xl overflow-hidden">
                        <div className="bg-green-600 text-white p-5 text-center">
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="font-bold text-xl">Payment Successful!</p>
                          <p className="text-green-100 text-sm mt-1">Thank you for your generosity</p>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                          {pesapalConfirmation && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                              <span className="text-gray-500">Confirmation Code</span>
                              <span className="font-semibold text-gray-900">{pesapalConfirmation}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Date</span>
                            <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('en-KE', { dateStyle: 'long' })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="font-semibold text-green-600">Confirmed</span>
                          </div>
                        </div>
                        <div className="px-5 pb-5">
                          <button onClick={() => setPesapalReturn(null)} className="w-full border-2 border-green-500 text-green-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors">
                            Give Again
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Return: failed */}
                    {pesapalReturn === 'failed' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-red-900">Payment failed</p>
                          <p className="text-sm text-red-700 mt-1">Your card was not charged. Please try again.</p>
                        </div>
                        <button onClick={() => setPesapalReturn(null)} className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
                          Try Again
                        </button>
                      </div>
                    )}

                    {/* Return: pending */}
                    {pesapalReturn === 'pending' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
                        <p className="font-bold text-amber-900">Payment pending</p>
                        <p className="text-sm text-amber-700">We&apos;re waiting for confirmation from your bank. You&apos;ll receive a receipt once complete.</p>
                        <button onClick={() => setPesapalReturn(null)} className="text-sm text-amber-700 underline">Pay again</button>
                      </div>
                    )}

                    {/* Pesapal iframe */}
                    {iframeUrl && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        {!iframeLoaded && (
                          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 gap-3">
                            <svg className="w-8 h-8 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-sm text-gray-500">Loading secure checkout…</p>
                          </div>
                        )}
                        <iframe
                          src={iframeUrl}
                          onLoad={() => setIframeLoaded(true)}
                          className={`w-full border-0 transition-all ${iframeLoaded ? 'block' : 'hidden'}`}
                          style={{ height: '560px' }}
                          title="Secure Card Payment"
                          allow="payment"
                        />
                        <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center justify-between">
                          <p className="text-xs text-gray-400 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secured by Pesapal · 256-bit SSL
                          </p>
                          <button onClick={() => { setIframeUrl(null); setIframeLoaded(false); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card form */}
                    {!pesapalReturn && !iframeUrl && (
                      <>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">💳</span>
                            <div>
                              <h3 className="font-bold text-amber-900">Pay by Card</h3>
                              <p className="text-xs text-amber-700">Enter your details — checkout loads right here on this page</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                              <input type="text" value={cardFirstName} onChange={e => setCardFirstName(e.target.value)} placeholder="John"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                              <input type="text" value={cardLastName} onChange={e => setCardLastName(e.target.value)} placeholder="Doe"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                            <input type="email" value={cardEmail} onChange={e => setCardEmail(e.target.value)} placeholder="you@example.com"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
                          </div>

                          {finalAmount > 0 && (
                            <div className="bg-white border border-amber-200 rounded-xl p-4 space-y-2 text-sm">
                              <div className="flex justify-between text-gray-600">
                                <span>Category</span>
                                <span className="font-semibold text-gray-900">{givingInfo.givingCategories.find(c => c.id === category)?.label ?? 'Offering'}</span>
                              </div>
                              {recurring && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Frequency</span>
                                  <span className="font-semibold text-blue-700">Monthly recurring</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-amber-100 pt-2">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-amber-700 text-base">KES {finalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {cardError && (
                          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{cardError}</p>
                        )}

                        <button
                          onClick={handleCardPay}
                          disabled={finalAmount < 10 || cardLoading}
                          className="w-full bg-gradient-to-r from-amber-600 to-amber-500 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.01] disabled:hover:scale-100 transition-all flex items-center justify-center gap-2">
                          {cardLoading ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Loading checkout…
                            </>
                          ) : (
                            finalAmount > 0 ? `Pay KES ${finalAmount.toLocaleString()}` : 'Select an amount to continue'
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-blue-900 text-white rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Why We Give</h3>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  Giving at ACK Mombasa is an act of worship and an expression of trust in God&apos;s provision.
                  Your gifts fund the ministry of the cathedral — from Sunday services to community outreach.
                </p>
                <div className="space-y-3">
                  {[
                    'Sunday services & worship',
                    'Youth & children programs',
                    'Community outreach & feeding',
                    'Cathedral maintenance',
                    'Missions & evangelism',
                    'Staff & clergy support',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-blue-200">
                      <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Financial Accountability</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We are committed to transparency. Audited financial reports are presented at the Annual General Meeting and available to all members.
                </p>
                <button className="w-full border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-gray-400 transition-colors">
                  Request Annual Report
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <svg className="w-8 h-8 text-amber-400 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-sm text-amber-900 italic leading-relaxed">
                  &quot;Giving my tithe faithfully has been a spiritual discipline that has deepened my trust in God.
                  The cathedral has been a blessing to my family and our community for generations.&quot;
                </p>
                <p className="text-xs text-amber-700 font-semibold mt-3">— Margaret N., Member since 1985</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function GivePageWrapper() {
  return (
    <Suspense>
      <GivePage />
    </Suspense>
  );
}
