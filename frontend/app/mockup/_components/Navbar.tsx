'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/mockup' },
  { label: 'Worship', href: '/mockup#worship' },
  { label: 'Sermons', href: '/mockup/sermons' },
  { label: 'Events', href: '/mockup/events' },
];

const aboutLinks = [
  { label: 'Cathedral History', href: '/mockup/history' },
  { label: 'Leadership', href: '/mockup/about' },
  { label: 'Mission & Vision', href: '/mockup/about#mission' },
  { label: 'Photo Gallery', href: '/mockup/gallery' },
];

const ministriesLinks = [
  { label: "Children's Ministry", href: '/mockup/ministries#children' },
  { label: 'Youth Ministry (AYYA)', href: '/mockup/ministries#youth' },
  { label: "Women's Fellowship (MWA)", href: '/mockup/ministries#women' },
  { label: "Men's Fellowship (KAMA)", href: '/mockup/ministries#men' },
  { label: 'Choir & Music', href: '/mockup/ministries#choir' },
  { label: 'Prayer Ministry', href: '/mockup/ministries#prayer' },
  { label: 'Missions & Outreach', href: '/mockup/ministries#missions' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileMinistriesOpen, setMobileMinistriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Logo */}
          <Link href="/mockup" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-900 font-bold text-base leading-tight">ACK Cathedral Mombasa</p>
              <p className="text-gray-500 text-xs">Anglican Church of Kenya</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${isActive(link.href) ? 'text-blue-900 font-semibold' : 'text-gray-700 hover:text-blue-900'}`}
              >
                {link.label}
              </Link>
            ))}

            {/* About Dropdown */}
            <div className="relative group">
              <button className={`text-sm font-medium flex items-center gap-1 transition-colors text-gray-700 hover:text-blue-900 ${pathname.startsWith('/mockup/about') || pathname === '/mockup/history' || pathname === '/mockup/gallery' ? 'text-blue-900 font-semibold' : ''}`}>
                About
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                {aboutLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Ministries Dropdown */}
            <div className="relative group">
              <button className={`text-sm font-medium flex items-center gap-1 transition-colors text-gray-700 hover:text-blue-900 ${pathname.startsWith('/mockup/ministries') ? 'text-blue-900 font-semibold' : ''}`}>
                Ministries
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                <Link href="/mockup/ministries" className="block px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors border-b border-gray-100">
                  All Ministries →
                </Link>
                {ministriesLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/mockup/contact" className={`text-sm font-medium transition-colors ${isActive('/mockup/contact') ? 'text-blue-900 font-semibold' : 'text-gray-700 hover:text-blue-900'}`}>
              Contact
            </Link>

            <Link href="/mockup/give" className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-md hover:scale-105 transition-all">
              Give
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href) ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}

            {/* Mobile About */}
            <div>
              <button onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className="w-full flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                About
                <svg className={`w-4 h-4 transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileAboutOpen && (
                <div className="pl-4 space-y-1">
                  {aboutLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-900 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Ministries */}
            <div>
              <button onClick={() => setMobileMinistriesOpen(!mobileMinistriesOpen)}
                className="w-full flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Ministries
                <svg className={`w-4 h-4 transition-transform ${mobileMinistriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileMinistriesOpen && (
                <div className="pl-4 space-y-1">
                  {ministriesLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-900 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/mockup/contact" onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Contact
            </Link>

            <div className="pt-2 px-4">
              <Link href="/mockup/give" onClick={() => setMobileOpen(false)}
                className="block w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-3 rounded-lg text-sm font-semibold text-center hover:shadow-md transition-all">
                Give Online
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
