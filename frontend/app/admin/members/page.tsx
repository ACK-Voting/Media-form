'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { usersAPI, rolesAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { User, Role, UserRole } from '@/types';

interface RegistrationData {
  fullName: string;
  gender: string;
  ageRange: string;
  phoneNumber: string;
  email: string;
  parishLocation?: string;
  parishName?: string;
  isMember: boolean;
  membershipNumber?: string;
  mediaSkills: string[];
  otherSkills?: string;
  areaOfInterest?: string[];
  hasExperience: boolean;
  experienceDetails?: string;
  hasEquipment?: boolean;
  equipmentDescription?: string;
  availability: string;
  commitment: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  additionalInfo?: string;
  submittedAt: string;
  status: string;
}

interface UserWithRoles extends User {
  roles?: Role[];
  registrationId?: RegistrationData;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  skillsBreakdown: { _id: string; count: number }[];
  parishDistribution: { _id: string; count: number }[];
  roleDistribution: { roleName: string; count: number }[];
}

function MembersPage() {
  const { showSuccess, showError } = useToast();
  const [members, setMembers] = useState<UserWithRoles[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<UserWithRoles | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleNotes, setRoleNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'toggleStatus' | 'removeRole' | null;
    data?: any;
  }>({ isOpen: false, type: null });

  // Fetch members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const isActive = filterActive === 'all' ? undefined : filterActive === 'active';
      const response = await usersAPI.getAll(1, 100, searchTerm, isActive);
      if (response.success) {
        setMembers(response.data);
      }
    } catch (error: any) {
      showError('Failed to Load Members', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await usersAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      showError('Failed to Load Stats', error.response?.data?.message || error.message);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      if (response.success) {
        setRoles(response.roles || []);
      }
    } catch (error: any) {
      showError('Failed to Load Roles', error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [searchTerm, filterActive]);

  useEffect(() => {
    fetchStats();
    fetchRoles();
  }, []);

  // View member details - fetch full details
  const viewMemberDetails = async (member: UserWithRoles) => {
    setActionLoading(true);
    try {
      const response = await usersAPI.getOne(member._id);
      if (response.success) {
        setSelectedMember(response.data);
        setShowDetailsModal(true);
      }
    } catch (error: any) {
      showError('Failed to Load Member Details', error.response?.data?.message || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open assign role modal
  const openAssignRoleModal = (member: UserWithRoles) => {
    setSelectedMember(member);
    setShowRoleModal(true);
    setSelectedRole('');
    setRoleNotes('');
  };

  // Assign role
  const handleAssignRole = async () => {
    if (!selectedMember || !selectedRole) {
      showError('Validation Error', 'Please select a role');
      return;
    }

    setActionLoading(true);
    try {
      await rolesAPI.assignRole(selectedMember._id, selectedRole, roleNotes || undefined);
      showSuccess('Role Assigned', 'Role has been successfully assigned to the member');
      setShowRoleModal(false);
      setSelectedRole('');
      setRoleNotes('');
      await fetchMembers();
    } catch (error: any) {
      showError('Failed to Assign Role', error.response?.data?.message || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Remove role
  const handleRemoveRole = async () => {
    const { userId, roleId } = confirmAction.data || {};
    if (!userId || !roleId) return;

    setActionLoading(true);
    try {
      await rolesAPI.removeRole(userId, roleId);
      showSuccess('Role Removed', 'Role has been successfully removed from the member');
      setConfirmAction({ isOpen: false, type: null });
      await fetchMembers();
      if (selectedMember) {
        // Refresh selected member details
        const updatedMember = members.find(m => m._id === selectedMember._id);
        if (updatedMember) {
          setSelectedMember(updatedMember);
        }
      }
    } catch (error: any) {
      showError('Failed to Remove Role', error.response?.data?.message || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async () => {
    const { userId } = confirmAction.data || {};
    if (!userId) return;

    setActionLoading(true);
    try {
      await usersAPI.toggleStatus(userId);
      showSuccess('Status Updated', 'Member status has been successfully updated');
      setConfirmAction({ isOpen: false, type: null });
      await fetchMembers();
      await fetchStats();
    } catch (error: any) {
      showError('Failed to Update Status', error.response?.data?.message || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Get available roles for member (exclude already assigned)
  const getAvailableRoles = (member: UserWithRoles) => {
    const assignedRoleIds = member.roles?.map(r => r._id) || [];
    return roles.filter(role => !assignedRoleIds.includes(role._id));
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Members</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.total || 0}
            </p>
          </Card>
          <Card className="border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Active Members</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.active || 0}
            </p>
          </Card>
          <Card className="border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Inactive Members</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.inactive || 0}
            </p>
          </Card>
          <Card className="border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Top Skill</p>
            <p className="text-lg font-bold text-gray-900 mt-2">
              {stats?.skillsBreakdown?.[0]?._id || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {stats?.skillsBreakdown?.[0]?.count || 0} members
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search Members"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Input
              label="Status"
              as="select"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              options={[
                { value: 'all', label: 'All Members' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
            />
          </div>
        </Card>

        {/* Members List */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading members...</p>
            </div>
          </Card>
        ) : members.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="mt-4 text-gray-600">No members found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filterActive !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No members have been added yet'}
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                          <div className="text-sm text-gray-500">@{member.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.email}</div>
                        {member.phone && <div className="text-sm text-gray-500">{member.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.registrationId?.mediaSkills?.slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {(member.registrationId?.mediaSkills?.length || 0) > 2 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              +{member.registrationId!.mediaSkills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.roles?.slice(0, 2).map((role) => (
                            <span
                              key={role._id}
                              className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
                            >
                              {role.name}
                            </span>
                          ))}
                          {(member.roles?.length || 0) > 2 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              +{member.roles!.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            member.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => viewMemberDetails(member)}
                          className="text-xs"
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => openAssignRoleModal(member)}
                          className="text-xs"
                        >
                          Assign Role
                        </Button>
                        <Button
                          variant={member.isActive ? 'danger' : 'success'}
                          onClick={() =>
                            setConfirmAction({
                              isOpen: true,
                              type: 'toggleStatus',
                              data: { userId: member._id, currentStatus: member.isActive },
                            })
                          }
                          className="text-xs"
                        >
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Member Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Member Details"
        size="xl"
      >
        {actionLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading member details...</p>
          </div>
        ) : selectedMember && selectedMember.registrationId && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Account Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedMember.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedMember.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Application Status</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {selectedMember.registrationId.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedMember.registrationId.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.registrationId.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedMember.registrationId.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age Range</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.registrationId.ageRange}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.registrationId.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.registrationId.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Parish Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Parish Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Parish Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMember.registrationId.parishLocation || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parish Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMember.registrationId.parishName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Is Parish Member</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedMember.registrationId.isMember
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedMember.registrationId.isMember ? 'Yes' : 'No'}
                  </span>
                </div>
                {selectedMember.registrationId.membershipNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Membership Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedMember.registrationId.membershipNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Interests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Interests</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Media Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.registrationId.mediaSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedMember.registrationId.otherSkills && (
                  <div>
                    <p className="text-sm text-gray-600">Other Skills</p>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.registrationId.otherSkills}</p>
                  </div>
                )}
                {selectedMember.registrationId.areaOfInterest && selectedMember.registrationId.areaOfInterest.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Areas of Interest</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.registrationId.areaOfInterest.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Experience & Equipment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience & Equipment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Has Experience</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedMember.registrationId.hasExperience
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedMember.registrationId.hasExperience ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Has Equipment</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedMember.registrationId.hasEquipment
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedMember.registrationId.hasEquipment ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              {selectedMember.registrationId.experienceDetails && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Experience Details</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedMember.registrationId.experienceDetails}
                  </p>
                </div>
              )}
              {selectedMember.registrationId.equipmentDescription && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Equipment Description</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedMember.registrationId.equipmentDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Availability & Commitment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability & Commitment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Availability</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.registrationId.availability}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Commitment Level</p>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.registrationId.commitment}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMember.registrationId.emergencyContactName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relationship</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMember.registrationId.emergencyContactRelationship}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMember.registrationId.emergencyContactPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {selectedMember.registrationId.additionalInfo && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                <p className="text-sm text-gray-900">{selectedMember.registrationId.additionalInfo}</p>
              </div>
            )}

            {/* Assigned Roles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Assigned Roles</h3>
              {selectedMember.roles && selectedMember.roles.length > 0 ? (
                <div className="space-y-2">
                  {selectedMember.roles.map((role: any) => (
                    <div
                      key={role.roleId?._id || role._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{role.roleId?.name || role.name}</p>
                        <p className="text-xs text-gray-600">{role.roleId?.description || role.description}</p>
                        {role.assignedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned on {new Date(role.assignedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="danger"
                        onClick={() =>
                          setConfirmAction({
                            isOpen: true,
                            type: 'removeRole',
                            data: {
                              userId: selectedMember._id,
                              roleId: role.roleId?._id || role._id,
                              roleName: role.roleId?.name || role.name,
                            },
                          })
                        }
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No roles assigned yet</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Assign Role"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Assigning role to: <span className="font-medium">{selectedMember?.fullName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Role *</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- Select a role --</option>
              {selectedMember &&
                getAvailableRoles(selectedMember).map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name} - {role.description}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={roleNotes}
              onChange={(e) => setRoleNotes(e.target.value)}
              placeholder="Add any notes about this role assignment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignRole} isLoading={actionLoading}>
              Assign Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmAction.isOpen}
        title={
          confirmAction.type === 'toggleStatus'
            ? confirmAction.data?.currentStatus
              ? 'Deactivate Member'
              : 'Activate Member'
            : 'Remove Role'
        }
        message={
          confirmAction.type === 'toggleStatus'
            ? confirmAction.data?.currentStatus
              ? 'Are you sure you want to deactivate this member? They will no longer have access to the system.'
              : 'Are you sure you want to activate this member? They will regain access to the system.'
            : `Are you sure you want to remove the role "${confirmAction.data?.roleName}" from this member?`
        }
        confirmText={confirmAction.type === 'toggleStatus' ? 'Confirm' : 'Remove'}
        cancelText="Cancel"
        variant={confirmAction.type === 'toggleStatus' && confirmAction.data?.currentStatus ? 'danger' : 'default'}
        isLoading={actionLoading}
        onConfirm={confirmAction.type === 'toggleStatus' ? handleToggleStatus : handleRemoveRole}
        onCancel={() => setConfirmAction({ isOpen: false, type: null })}
      />
    </AdminLayout>
  );
}

export default function Members() {
  return (
    <ProtectedRoute>
      <MembersPage />
    </ProtectedRoute>
  );
}
