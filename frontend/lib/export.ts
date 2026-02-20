import type { Registration } from '@/types';

export const exportToCSV = (data: Registration[], filename: string = 'submissions') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Define CSV headers
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Gender',
    'Age Range',
    'Parish Location',
    'Parish Name',
    'Is Member',
    'Membership Number',
    'Media Skills',
    'Other Skills',
    'Areas of Interest',
    'Has Experience',
    'Experience Details',
    'Availability',
    'Commitment',
    'Has Equipment',
    'Equipment Description',
    'Emergency Contact Name',
    'Emergency Contact Phone',
    'Emergency Contact Relationship',
    'Additional Info',
    'Status',
    'Submitted At',
    'Approved At',
    'Rejection Reason',
  ];

  // Convert data to CSV rows
  const rows = data.map((submission) => {
    return [
      submission.fullName,
      submission.email,
      submission.phoneNumber,
      submission.gender,
      submission.ageRange,
      submission.parishLocation || '',
      submission.parishName || '',
      submission.isMember ? 'Yes' : 'No',
      submission.membershipNumber || '',
      submission.mediaSkills?.join('; ') || '',
      submission.otherSkills || '',
      submission.areaOfInterest?.join('; ') || '',
      submission.hasExperience ? 'Yes' : 'No',
      submission.experienceDetails || '',
      submission.availability || '',
      submission.commitment || '',
      submission.hasEquipment ? 'Yes' : 'No',
      submission.equipmentDescription || '',
      submission.emergencyContactName,
      submission.emergencyContactPhone,
      submission.emergencyContactRelationship,
      submission.additionalInfo || '',
      submission.status,
      new Date(submission.submittedAt).toLocaleString(),
      submission.approvedAt ? new Date(submission.approvedAt).toLocaleString() : '',
      submission.rejectionReason || '',
    ].map(escapeCSVField);
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to escape CSV fields
const escapeCSVField = (field: any): string => {
  if (field === null || field === undefined) {
    return '';
  }

  const stringField = String(field);

  // If field contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};

// Export filtered submissions
export const exportFilteredSubmissions = async (
  filters: {
    search?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    skills?: string[];
  },
  getAll: (page: number, limit: number, search: string, status: string, sortBy: string, sortOrder: string) => Promise<any>
) => {
  try {
    // Fetch all submissions with current filters (high limit to get all)
    const response = await getAll(1, 10000, filters.search || '', filters.status || '', 'submittedAt', 'desc');

    if (response.success && response.data) {
      exportToCSV(response.data, 'filtered_submissions');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

// Generic CSV export function for any data type
export const exportDataToCSV = (data: any[], headers: string[], rowMapper: (item: any) => any[], filename: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Convert data to CSV rows using the provided mapper
  const rows = data.map(item => rowMapper(item).map(escapeCSVField));

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
