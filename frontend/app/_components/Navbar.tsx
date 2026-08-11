'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContactInfoStore } from '@/stores/cms/contactInfoStore';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { CATHEDRAL_CHANNEL_URL } from '@/hooks/useYouTubeVideos';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Worship', href: '/#worship' },
  { label: 'Sermons', href: '/sermons' },
  { label: 'Events', href: '/events' },
];

const aboutLinks = [
  { label: 'Cathedral History', href: '/history' },
  { label: 'Cathedral Clergy & Wardens', href: '/about#clergy' },
  { label: 'Cathedral Staff', href: '/staff' },
  { label: 'Mission & Vision', href: '/about#mission' },
  { label: 'Photo Gallery', href: '/gallery' },
  { label: 'News & Announcements', href: '/announcements' },
  { label: 'Resources & Downloads', href: '/resources' },
];

type NavbarProps = {
  /**
   * Sit transparently over a full-bleed hero until the visitor scrolls, and
   * show the contact strip above the bar. Used by the home page, which
   * previously carried its own copy of this whole component.
   */
  transparentUntilScroll?: boolean;
};

export default function Navbar({ transparentUntilScroll = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileMinistriesOpen, setMobileMinistriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Ministry links come from the CMS so the dropdown can't drift from the
  // ministries that actually exist.
  const ministries = useMinistriesStore((s) => s.ministries);
  const { departments } = useContactInfoStore();
  const general = departments.find((d) => /general/i.test(d.name)) ?? departments[0];

  useEffect(() => {
    // 80px matches the hero's breathing room; below that the bar is over the
    // image and needs to be transparent.
    const threshold = transparentUntilScroll ? 80 : 10;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentUntilScroll]);

  // Transparent only while over the hero, and never while the mobile menu is
  // open — the menu needs a readable background.
  const clear = transparentUntilScroll && !scrolled && !mobileOpen;

  const isActive = (href: string) => pathname === href;
  const linkCls = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active
        ? clear ? 'text-white font-semibold' : 'text-blue-900 font-semibold'
        : clear ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-blue-900'
    }`;

  return (
    <>
      {/* Contact strip — only over the hero, and only on wider screens */}
      {transparentUntilScroll && (
        <div className={`hidden sm:block fixed top-0 left-0 right-0 z-50 text-white text-sm py-2 transition-all duration-300 ${
          clear ? 'bg-transparent opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              {general?.phone && (
                <a href={`tel:${general.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {general.phone}
                </a>
              )}
              {general?.email && (
                <a href={`mailto:${general.email}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {general.email}
                </a>
              )}
            </div>
            <a href={CATHEDRAL_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors" aria-label="YouTube">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      )}

      <nav className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
        clear
          ? `bg-transparent top-0 ${transparentUntilScroll ? 'sm:top-9' : ''}`
          : 'top-0 bg-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
                <img src="/logo_1.jpeg" alt="ACK Mombasa Memorial Cathedral" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-base leading-tight transition-colors ${clear ? 'text-white' : 'text-blue-900'}`}>
                  <span className="sm:hidden">ACK Mombasa Cathedral</span>
                  <span className="hidden sm:inline">ACK Mombasa Memorial Cathedral</span>
                </p>
                <p className={`text-xs transition-colors ${clear ? 'text-white/70' : 'text-gray-500'}`}>
                  Anglican Church of Kenya
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkCls(isActive(link.href))}>
                  {link.label}
                </Link>
              ))}

              {/* About Dropdown */}
              <div className="relative group">
                <button className={`${linkCls(pathname.startsWith('/about') || ['/history', '/gallery', '/staff'].includes(pathname))} flex items-center gap-1`}>
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
                <button className={`${linkCls(pathname.startsWith('/ministries'))} flex items-center gap-1`}>
                  Ministries
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 max-h-[70vh] overflow-y-auto">
                  <Link href="/ministries" className="block px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors border-b border-gray-100">
                    All Ministries →
                  </Link>
                  {ministries.map((m) => (
                    <Link key={m.slug} href={`/ministries/${m.slug}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors">
                      {m.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/get-involved" className={linkCls(isActive('/get-involved'))}>Get Involved</Link>
              <Link href="/contact" className={linkCls(isActive('/contact'))}>Contact</Link>
              <Link href="/give" className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-md hover:scale-105 transition-all">
                Give
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
              className={`lg:hidden p-2 rounded-lg transition-colors ${clear ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 space-y-1 max-h-[75vh] overflow-y-auto">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href) ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {link.label}
                </Link>
              ))}

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
                    {ministries.map((m) => (
                      <Link key={m.slug} href={`/ministries/${m.slug}`} onClick={() => setMobileOpen(false)}
                        className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-900 transition-colors">
                        {m.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/get-involved" onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Get Involved
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Contact
              </Link>

              <div className="pt-2 px-4">
                <Link href="/give" onClick={() => setMobileOpen(false)}
                  className="block w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-3 rounded-lg text-sm font-semibold text-center hover:shadow-md transition-all">
                  Give Online
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
