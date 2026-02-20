export interface Registration {
    _id: string;
    fullName: string;
    gender: string;
    ageRange: string;
    phoneNumber: string;
    email: string;
    parishLocation: string;
    parishName: string;
    isMember: boolean;
    membershipNumber?: string;
    mediaSkills: string[];
    otherSkills?: string;
    areaOfInterest: string[];
    hasExperience: boolean;
    experienceDetails?: string;
    availability: string;
    commitment: string;
    hasEquipment: boolean;
    equipmentDescription?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    additionalInfo?: string;
    status: 'pending' | 'approved' | 'rejected' | 'account_created';
    submittedAt: string;
    userId?: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
}

export interface Admin {
    _id: string;
    username: string;
    email: string;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    profileImage?: string;
    isActive: boolean;
    registrationId?: string;
    lastLogin?: string;
    createdAt: string;
}

export interface Role {
    _id: string;
    name: string;
    slug: string;
    description: string;
    responsibilities: string[];
    permissions: string[];
    isActive: boolean;
}

export interface UserRole {
    _id: string;
    userId: string;
    roleId: Role;
    assignedBy: string;
    assignedAt: string;
    notes?: string;
}

export interface Notification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

export interface Event {
    _id: string;
    title: string;
    description?: string;
    eventDate: string;
    eventTime?: string;
    location?: string;
    eventType: 'service' | 'rehearsal' | 'meeting' | 'training' | 'special' | 'other';
    createdBy: string;
    attendees: string[];
    isPublic: boolean;
    createdAt: string;
}

export interface MeetingMinutes {
    _id: string;
    title: string;
    meetingDate: string;
    attendees: User[];
    summary?: string;
    content: string;
    attachments: {
        filename: string;
        originalName: string;
        path: string;
        size: number;
        mimetype: string;
    }[];
    uploadedBy: User;
    isPublished: boolean;
    createdAt: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    admin: Admin;
    message?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

export interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    accountCreated: number;
}
