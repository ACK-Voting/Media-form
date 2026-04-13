'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { givingInfo } from '../_data/mockData';

const amounts = [500, 1000, 2000, 5000, 10000];

export default function GivePage() {
  const [method, setMethod] = useState<'mpesa' | 'card' | 'bank'>('mpesa');
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [category, setCategory] = useState('tithe');
  const [recurring, setRecurring] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const finalAmount = amount !== '' ? amount : customAmount ? parseInt(customAmount) : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-amber-700 to-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
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

            {/* Giving Form — left 3 columns */}
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
                  <button onClick={() => setRecurring(!recurring)}
                    className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all ${recurring ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${recurring ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {recurring && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Make this a recurring gift</p>
                      <p className="text-xs text-gray-500">Give automatically every month</p>
                    </div>
                  </button>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                  <div className="flex gap-3">
                    {([
                      { id: 'mpesa', label: 'M-PESA', icon: '📱' },
                      { id: 'card', label: 'Card', icon: '💳' },
                      { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
                    ] as const).map(m => (
                      <button key={m.id} onClick={() => setMethod(m.id)}
                        className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${method === m.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className="text-xl">{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* M-PESA Instructions */}
                {method === 'mpesa' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                      <span className="text-lg">📱</span> M-PESA Payment
                    </h3>
                    <ol className="space-y-3 text-sm text-green-800">
                      <li className="flex gap-3">
                        <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                        Go to <strong>M-PESA</strong> on your phone → Lipa na M-PESA → Paybill
                      </li>
                      <li className="flex gap-3">
                        <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                        Enter Paybill Number:
                        <button onClick={() => copyToClipboard(givingInfo.mpesa.paybill, 'paybill')} className="font-bold underline text-green-900 hover:text-green-700">
                          {givingInfo.mpesa.paybill} {copied === 'paybill' ? '✓ Copied!' : '(copy)'}
                        </button>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                        Account Number: <strong>TITHE</strong>, <strong>OFFERING</strong>, or <strong>YOUR NAME</strong>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                        Enter Amount{finalAmount > 0 ? `: KES ${finalAmount.toLocaleString()}` : ''} and PIN
                      </li>
                    </ol>
                  </div>
                )}

                {/* Card Payment */}
                {method === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input type="text" placeholder="John" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input type="text" placeholder="Doe" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input type="text" placeholder="4242 4242 4242 4242" maxLength={19} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                        <input type="text" placeholder="MM / YY" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input type="text" placeholder="123" maxLength={4} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Payments secured by 256-bit SSL encryption (card payments coming soon)
                    </p>
                  </div>
                )}

                {/* Bank Transfer */}
                {method === 'bank' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <span>🏦</span> Bank Transfer Details
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Bank', value: givingInfo.bank.name },
                        { label: 'Branch', value: givingInfo.bank.branch },
                        { label: 'Account Name', value: givingInfo.bank.accountName },
                        { label: 'Account No.', value: givingInfo.bank.accountNumber },
                        { label: 'SWIFT Code', value: givingInfo.bank.swiftCode },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center border-b border-blue-100 pb-2">
                          <span className="text-sm text-blue-600 font-medium">{row.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-900 font-bold">{row.value}</span>
                            <button onClick={() => copyToClipboard(row.value, row.label)} className="text-blue-400 hover:text-blue-600 transition-colors">
                              {copied === row.label
                                ? <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              }
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-3">Please use your name and giving category as the reference (e.g. &quot;John Doe — Tithe&quot;).</p>
                  </div>
                )}

                {/* Summary & Submit */}
                {finalAmount > 0 && method !== 'bank' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm">
                    <div className="flex justify-between text-gray-700 mb-1">
                      <span>Category</span>
                      <span className="font-semibold">{givingInfo.givingCategories.find(c => c.id === category)?.label}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-1">
                      <span>Amount</span>
                      <span className="font-semibold">KES {finalAmount.toLocaleString()}</span>
                    </div>
                    {recurring && (
                      <div className="flex justify-between text-gray-700">
                        <span>Frequency</span>
                        <span className="font-semibold">Monthly</span>
                      </div>
                    )}
                  </div>
                )}

                {method !== 'bank' && (
                  <button
                    onClick={() => alert('Thank you for giving! (This is a mockup — real payment integration coming soon)')}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.01] transition-all"
                  >
                    {finalAmount > 0 ? `Give KES ${finalAmount.toLocaleString()}` : 'Give Now'}
                    {recurring ? ' Monthly' : ''}
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar — right 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Why Give */}
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

              {/* Annual Report CTA */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Financial Accountability</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We are committed to transparency. Audited financial reports are presented at the Annual General Meeting and available to all members.
                </p>
                <button className="w-full border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-gray-400 transition-colors">
                  Request Annual Report
                </button>
              </div>

              {/* Testimony */}
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
