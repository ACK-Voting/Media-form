'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { leadership } from '../_data/mockData';

const values = [
  {
    title: 'Biblical Truth',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    desc: 'We are grounded in the authority of the Holy Scriptures as the supreme rule of faith and practice.',
    color: 'blue',
  },
  {
    title: 'Authentic Worship',
    icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
    desc: 'We pursue God-centred worship that honours the Anglican tradition while embracing the fullness of the Holy Spirit.',
    color: 'purple',
  },
  {
    title: 'Compassionate Service',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    desc: 'We believe faith without works is dead. We actively serve our community through outreach, care, and justice.',
    color: 'red',
  },
  {
    title: 'Faithful Discipleship',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    desc: 'We are committed to making and maturing disciples who love God, love people, and multiply the church.',
    color: 'green',
  },
  {
    title: 'Radical Generosity',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'Generous giving of time, talent, and treasure is central to our identity as a tithing, giving community.',
    color: 'amber',
  },
  {
    title: 'Inclusive Community',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
    desc: 'We are a house of prayer for all nations — welcoming all people regardless of background, tribe, or culture.',
    color: 'teal',
  },
];

const beliefs = [
  'The Holy Trinity — Father, Son, and Holy Spirit',
  'The full authority and divine inspiration of Scripture',
  'The sinfulness of all humanity and the need for salvation',
  'Justification by grace through faith in Jesus Christ alone',
  'The physical resurrection of Jesus Christ from the dead',
  'The presence and ministry of the Holy Spirit in believers',
  'The universal Church as the Body of Christ on earth',
  'The physical, visible return of Jesus Christ in glory',
  'Resurrection of the dead and eternal life for all believers',
  'The Great Commission to make disciples of all nations',
];

export default function AboutPage() {
  const [activeLeader, setActiveLeader] = useState<string | null>(null);
  const clergy = leadership.filter(l => l.ordained);
  const layLeaders = leadership.filter(l => !l.ordained);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              ABOUT THE CATHEDRAL
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Who We Are &amp;<br />What We Believe
            </h1>
            <p className="text-lg text-blue-200 leading-relaxed max-w-2xl">
              ACK Mombasa Memorial Cathedral is the mother church of the Diocese of Mombasa, serving the coastal region of Kenya since 1903.
              We are an Anglican church in the tradition of the Church of England, committed to Word, sacrament, and service.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                OUR PURPOSE
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Mission &amp; Vision</h2>

              <div className="space-y-8">
                <div className="border-l-4 border-blue-900 pl-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To glorify God by making, maturing, and multiplying disciples of Jesus Christ — loving God, loving people,
                    and transforming our community and the world through the power of the Gospel.
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To be a vibrant, Spirit-filled cathedral that serves as a beacon of hope, healing, and transformation
                    on the Kenya coast — a house of prayer for all nations where every person encounters the living God.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Our Motto</h3>
                  <p className="text-gray-600 leading-relaxed text-xl italic font-medium">
                    &quot;A House of Prayer for All Nations&quot; — Isaiah 56:7
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '1903', label: 'Founded', sub: 'Over 120 years of faith' },
                { value: '2,500+', label: 'Active Members', sub: 'Growing congregation' },
                { value: '4', label: 'Sunday Services', sub: '7 AM, 9 AM, 11 AM, 6 PM' },
                { value: '10+', label: 'Ministry Groups', sub: 'Something for everyone' },
              ].map(stat => (
                <div key={stat.label} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
                  <p className="text-4xl font-bold text-blue-900 mb-1">{stat.value}</p>
                  <p className="font-semibold text-gray-900 text-sm">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Beliefs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              WHAT WE BELIEVE
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Core Beliefs</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              As an Anglican church, we hold to the historic Christian faith as expressed in the Apostles&apos; and Nicene Creeds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {beliefs.map((belief, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 font-medium">{belief}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              OUR VALUES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 bg-${v.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                  <svg className={`w-6 h-6 text-${v.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={v.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              OUR LEADERSHIP
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Meet the Team</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Our clergy and lay leaders are called to serve the congregation and the community with humility and faithfulness.
            </p>
          </div>

          {/* Clergy */}
          <h3 className="text-xl font-bold text-gray-900 mb-6">Clergy</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {clergy.map(leader => (
              <div key={leader.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100"
                onClick={() => setActiveLeader(activeLeader === leader.id ? null : leader.id)}>
                {/* Photo Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-700 to-indigo-700 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{leader.role}</p>
                  <h4 className="font-bold text-gray-900 mb-1">{leader.name}</h4>
                  {leader.ordained && (
                    <p className="text-xs text-gray-400">Ordained {leader.ordained}</p>
                  )}
                  {activeLeader === leader.id && (
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">{leader.bio}</p>
                  )}
                  {leader.email && (
                    <a href={`mailto:${leader.email}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-3 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Lay Leaders */}
          <h3 className="text-xl font-bold text-gray-900 mb-6">Church Wardens &amp; Lay Leadership</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layLeaders.map(leader => (
              <div key={leader.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{leader.name}</p>
                    <p className="text-sm text-blue-600 font-medium">{leader.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anglican Identity */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Anglican Identity</h2>
              <p className="text-blue-200 leading-relaxed mb-4">
                ACK Cathedral Mombasa belongs to the Anglican Church of Kenya, which is in the Anglican Communion —
                a worldwide fellowship of 85 million Christians in 165 countries.
              </p>
              <p className="text-blue-200 leading-relaxed mb-6">
                Our worship is shaped by the Book of Common Prayer tradition, combining ordered liturgy with evangelical
                preaching and charismatic renewal. We are evangelical in doctrine, Anglican in worship, and pentecostal in experience.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Book of Common Prayer', 'Apostles Creed', 'Nicene Creed', '39 Articles', 'Holy Scripture'].map(item => (
                  <span key={item} className="bg-white/10 border border-white/20 text-white text-sm px-4 py-1.5 rounded-full">{item}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">Diocese of Mombasa</h3>
              <div className="space-y-4 text-sm text-blue-200">
                {[
                  { label: 'Diocese', value: 'Diocese of Mombasa' },
                  { label: 'Province', value: 'Anglican Church of Kenya (ACK)' },
                  { label: 'Communion', value: 'Anglican Communion' },
                  { label: 'Mother Church', value: 'ACK Mombasa Memorial Cathedral' },
                  { label: 'Bishop', value: 'The Rt. Rev. Alphonce Mwaro Baya' },
                  { label: 'Archbishop', value: 'The Most Rev. Jackson Ole Sapit' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/50 font-medium">{item.label}</span>
                    <span className="text-white font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
