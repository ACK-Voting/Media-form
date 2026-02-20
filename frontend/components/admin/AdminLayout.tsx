'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { submissionsAPI, usersAPI } from '@/lib/api';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [quickStats, setQuickStats] = useState({
    todayApplications: 0,
    pendingReview: 0,
    activeMembers: 0,
  });

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Applications',
      href: '/admin/applications',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Team Members',
      href: '/admin/members',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Activity Monitor',
      href: '/admin/activity',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Fetch quick stats
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        // Fetch submissions stats
        const submissionsResponse = await submissionsAPI.getStats();
        if (submissionsResponse.success) {
          const stats = submissionsResponse.data;
          setQuickStats(prev => ({
            ...prev,
            todayApplications: stats.recentSubmissions || 0,
            pendingReview: stats.pending || 0,
          }));
        }

        // Fetch users stats
        const usersResponse = await usersAPI.getStats();
        if (usersResponse.success) {
          setQuickStats(prev => ({
            ...prev,
            activeMembers: usersResponse.data.active || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };

    fetchQuickStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <Link href="/admin" className="flex ml-2 md:mr-24">
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ACK Media Team Admin
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{admin?.username}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {admin?.username?.charAt(0).toUpperCase()}
                </div>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-20 w-64 h-screen pt-20 transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg transition-colors group ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className={isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}>
                    {item.icon}
                  </div>
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick Stats in Sidebar */}
          <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Recent Applications</span>
                <span className="font-semibold text-purple-600">{quickStats.todayApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Review</span>
                <span className="font-semibold text-yellow-600">{quickStats.pendingReview}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Members</span>
                <span className="font-semibold text-green-600">{quickStats.activeMembers}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`p-4 pt-20 transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
