'use client';

import React, { useState, useEffect } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { userAuthAPI, rolesAPI } from '@/lib/api';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
    const { user } = useUserAuth();
    const [roles, setRoles] = useState<any[]>([]);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ fullName: user.fullName || '', phone: user.phone || '' });
            loadRoles();
        }
    }, [user]);

    const loadRoles = async () => {
        if (!user?._id) {
            console.log('No user ID available for loading roles');
            return;
        }
        try {
            console.log('Loading roles for user:', user._id);
            const res = await rolesAPI.getUserRoles(user._id);
            console.log('Roles API response:', res);
            if (res.success) {
                console.log('Setting roles:', res.roles);
                setRoles(res.roles || []);
            } else {
                console.error('Roles request unsuccessful:', res);
            }
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await userAuthAPI.updateProfile(formData);
            if (res.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setEditing(false);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await userAuthAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
            if (res.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setChangingPassword(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">My Profile</h1>

            {/* Status Message */}
            {message.text && (
                <div className={`px-4 py-3 rounded-xl text-base ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 h-24">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                </div>
                <div className="px-6 pb-6 bg-white relative">
                    <div className="flex items-end gap-4 -mt-10 relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg hover:scale-105 transition-transform">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="pb-1 flex-1 bg-white pt-2 px-3 -ml-3 rounded-lg">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{user?.fullName}</h2>
                            <div className="flex flex-col gap-1 mt-1">
                                <p className="text-base text-gray-600 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium">@{user?.username}</span>
                                </p>
                                <p className="text-base text-gray-500 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">Personal Information</h3>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="text-base text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" variant="primary" size="sm" isLoading={saving}>Save Changes</Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                        </div>
                    </form>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Full Name</p>
                            <p className="text-base text-gray-900 mt-0.5">{user?.fullName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                            <p className="text-base text-gray-900 mt-0.5">{user?.email || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
                            <p className="text-base text-gray-900 mt-0.5">{user?.phone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Username</p>
                            <p className="text-base text-gray-900 mt-0.5">{user?.username || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Account Status</p>
                            <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {user?.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Member Since</p>
                            <p className="text-base text-gray-900 mt-0.5">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Assigned Roles */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">Assigned Roles</h3>
                {roles.length === 0 ? (
                    <p className="text-base text-gray-400">No roles assigned yet</p>
                ) : (
                    <div className="space-y-3">
                        {roles.map((ur: any) => (
                            <div key={ur._id} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                                <h4 className="font-semibold text-purple-900 text-base">{ur.roleId?.name}</h4>
                                <p className="text-sm text-purple-600 mt-1">{ur.roleId?.description}</p>
                                {ur.roleId?.responsibilities?.length > 0 && (
                                    <ul className="mt-2 space-y-0.5">
                                        {ur.roleId.responsibilities.map((r: string, i: number) => (
                                            <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                                                <span className="text-purple-400 mt-0.5">•</span>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">Password & Security</h3>
                    {!changingPassword && (
                        <button
                            onClick={() => setChangingPassword(true)}
                            className="text-base text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {changingPassword ? (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" variant="primary" size="sm" isLoading={saving}>Update Password</Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => setChangingPassword(false)}>Cancel</Button>
                        </div>
                    </form>
                ) : (
                    <p className="text-base text-gray-500">Your password was last updated when you first logged in with your temporary credentials.</p>
                )}
            </div>
        </div>
    );
}
