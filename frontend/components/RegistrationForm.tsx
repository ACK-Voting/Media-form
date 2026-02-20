'use client';

import { useState, useRef } from 'react';
import { submissionsAPI } from '@/lib/api';
import Input from './ui/Input';
import Button from './ui/Button';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function RegistrationForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        age: '',
        maritalStatus: '',
        phoneNumber: '',
        email: '',
        residentialAddress: '',
        isMember: undefined as boolean | undefined,
        membershipNumber: '',
        otherChurch: '',
        mediaRoles: [] as string[],
        otherRole: '',
        hasExperience: undefined as boolean | undefined,
        experienceDescription: '',
        hasEquipment: undefined as boolean | undefined,
        equipmentDescription: '',
        volunteerFrequency: '',
        preferredTimes: [] as string[],
        willingToTrain: undefined as boolean | undefined,
        motivation: '',
        commitmentDeclaration: false,
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    const mediaRolesOptions = [
        'Photography',
        'Videography',
        'Video Editing',
        'Graphic Design',
        'Social Media Management',
        'Content Writing',
        'Live Streaming & Technical Support',
        'Public Relations & Communications'
    ];

    const preferredTimesOptions = [
        'Sundays (Services & Events)',
        'Weekdays (Evenings)',
        'Weekdays (Mornings)',
        'Flexible'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;

        if (type === 'checkbox') {
            const checked = target.checked;
            if (name === 'mediaRoles' || name === 'preferredTimes') {
                const currentArray = formData[name as 'mediaRoles' | 'preferredTimes'];
                setFormData({
                    ...formData,
                    [name]: checked
                        ? [...currentArray, value]
                        : currentArray.filter((item) => item !== value),
                });
            } else {
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Map display labels to backend enum slugs
            const roleSlugMap: Record<string, string> = {
                'Photography': 'photography',
                'Videography': 'videography',
                'Video Editing': 'video-editing',
                'Graphic Design': 'graphic-design',
                'Social Media Management': 'social-media',
                'Content Writing': 'content-writing',
                'Live Streaming & Technical Support': 'live-streaming',
                'Public Relations & Communications': 'public-relations',
            };
            const availabilitySlugMap: Record<string, string> = {
                'Sundays (Services & Events)': 'sundays',
                'Weekdays (Evenings)': 'weekday-evenings',
                'Weekdays (Mornings)': 'weekday-mornings',
                'Flexible': 'flexible',
            };

            // Map frontend field names to backend model field names
            const submissionData = {
                fullName: formData.fullName,
                gender: formData.gender,
                ageRange: formData.age,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                parishLocation: formData.residentialAddress,
                parishName: formData.otherChurch || '',
                isMember: formData.isMember ?? false,
                membershipNumber: formData.membershipNumber,
                mediaSkills: formData.mediaRoles.map(r => roleSlugMap[r] || r.toLowerCase().replace(/\s+/g, '-')),
                otherSkills: formData.otherRole,
                areaOfInterest: formData.mediaRoles.map(r => roleSlugMap[r] || r.toLowerCase().replace(/\s+/g, '-')),
                hasExperience: formData.hasExperience ?? false,
                experienceDetails: formData.experienceDescription,
                hasEquipment: formData.hasEquipment ?? false,
                equipmentDescription: formData.equipmentDescription,
                availability: formData.preferredTimes.join(', '),
                commitment: formData.commitmentDeclaration ? 'Yes' : 'No',
                emergencyContactName: formData.emergencyContactName,
                emergencyContactRelationship: formData.emergencyContactRelationship,
                emergencyContactPhone: formData.emergencyContactPhone,
                additionalInfo: formData.motivation,
            };

            const response = await submissionsAPI.create(submissionData);

            if (response.success) {
                setSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err: any) {
            const errorData = err.response?.data;
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                setError(errorData.errors.map((e: any) => e.msg).join(', '));
            } else {
                setError(errorData?.message || 'Failed to submit form. Please try again.');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPos = 15;
            const leftMargin = 15;
            const rightMargin = pageWidth - 15;
            const contentWidth = rightMargin - leftMargin;

            // Colors
            const purple = [109, 40, 217]; // Purple for headers
            const lightGray = [249, 250, 251]; // Light background
            const darkGray = [55, 65, 81]; // Dark text

            // Helper to check if new page is needed
            const checkNewPage = (spaceNeeded: number = 30) => {
                if (yPos + spaceNeeded > pageHeight - 15) {
                    pdf.addPage();
                    yPos = 15;
                }
            };

            // Header banner with gradient effect
            pdf.setFillColor(109, 40, 217);
            pdf.rect(0, 0, pageWidth, 40, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ACK MOMBASA MEMORIAL CATHEDRAL', pageWidth / 2, 18, { align: 'center' });

            pdf.setFontSize(14);
            pdf.text('MEDIA TEAM REGISTRATION FORM', pageWidth / 2, 28, { align: 'center' });

            yPos = 50;

            // Helper to draw a section box
            const drawSection = (title: string, content: () => void) => {
                checkNewPage();

                // Section title with purple border
                pdf.setFillColor(249, 250, 251);
                pdf.setDrawColor(109, 40, 217);
                pdf.setLineWidth(0.5);
                pdf.rect(leftMargin, yPos - 5, contentWidth, 10, 'FD');

                pdf.setTextColor(109, 40, 217);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(title, leftMargin + 3, yPos + 2);

                yPos += 10;

                // Content box
                const contentStartY = yPos;
                pdf.setTextColor(55, 65, 81);
                content();

                // Draw border around content
                pdf.setDrawColor(229, 231, 235);
                pdf.setLineWidth(0.3);
                pdf.rect(leftMargin, contentStartY, contentWidth, yPos - contentStartY, 'S');

                yPos += 8;
            };

            // Helper to add a field with better organization
            const addField = (label: string, value: string, indent: number = 0, fullWidth: boolean = false) => {
                const fieldLeftMargin = leftMargin + 5 + indent;

                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(75, 85, 99);
                pdf.text(label, fieldLeftMargin, yPos);

                yPos += 4;

                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(31, 41, 55);
                pdf.setFontSize(10);
                const maxWidth = fullWidth ? contentWidth - 10 - indent : contentWidth - 15 - indent;
                const lines = pdf.splitTextToSize(value, maxWidth);
                pdf.text(lines, fieldLeftMargin, yPos);

                yPos += Math.max(6, lines.length * 5);
            };

            // Helper to add inline field (label and value on same line)
            const addInlineField = (label: string, value: string, xPos: number, maxWidth: number) => {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(75, 85, 99);
                const labelWidth = pdf.getTextWidth(label);
                pdf.text(label, xPos, yPos);

                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(31, 41, 55);
                const valueText = pdf.splitTextToSize(value, maxWidth - labelWidth - 2);
                pdf.text(valueText, xPos + labelWidth + 2, yPos);
            };

            // Introduction box
            pdf.setFillColor(245, 243, 255);
            pdf.setDrawColor(167, 139, 250);
            pdf.setLineWidth(0.5);
            pdf.rect(leftMargin, yPos, contentWidth, 20, 'FD');

            pdf.setTextColor(55, 65, 81);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const introText = pdf.splitTextToSize(
                'Thank you for your interest in joining the ACK Mombasa Memorial Cathedral Media Team! Your skills and dedication will help us spread the Gospel, document church activities, and enhance our digital presence.',
                contentWidth - 10
            );
            pdf.text(introText, leftMargin + 5, yPos + 6);
            yPos += 28;

            // Personal Information Section
            drawSection('Personal Information', () => {
                addField('1. Full Name', formData.fullName || 'N/A', 0, true);

                // Three column layout for Gender, Age, Marital Status
                const col1X = leftMargin + 5;
                const col2X = leftMargin + 70;
                const col3X = leftMargin + 125;

                addInlineField('2. Gender: ', formData.gender || 'N/A', col1X, 50);
                addInlineField('3. Age: ', (formData.age || 'N/A').toString(), col2X, 45);
                addInlineField('4. Marital Status: ', formData.maritalStatus || 'N/A', col3X, 60);

                yPos += 8;

                addField('5. Phone Number', formData.phoneNumber || 'N/A', 0, true);
                addField('6. Email Address', formData.email || 'N/A', 0, true);
                addField('7. Residential Address', formData.residentialAddress || 'N/A', 0, true);

                const memberStatus = formData.isMember === true ? 'Yes' : formData.isMember === false ? 'No' : 'N/A';
                addField('8. Are you a member of ACK Mombasa Memorial Cathedral?', memberStatus, 0, true);

                if (formData.isMember && formData.membershipNumber) {
                    addField('   Membership Number', formData.membershipNumber, 0, true);
                } else if (formData.isMember === false && formData.otherChurch) {
                    addField('   Church You Attend', formData.otherChurch, 0, true);
                }

                yPos += 3;
            });

            // Media Team Skills & Interests Section
            drawSection('Media Team Skills & Interests', () => {
                const roles = formData.mediaRoles.length > 0 ? formData.mediaRoles.join(', ') : 'N/A';
                addField('9. Which media team roles are you interested in? (Check all that apply)', roles, 0, true);

                if (formData.otherRole) {
                    addField('   Other role', formData.otherRole, 0, true);
                }

                const hasExp = formData.hasExperience === true ? 'Yes' : formData.hasExperience === false ? 'No' : 'N/A';
                addField('10. Do you have prior experience in media work?', hasExp, 0, true);

                if (formData.hasExperience && formData.experienceDescription) {
                    addField('   Please describe your experience', formData.experienceDescription, 0, true);
                }

                const hasEquip = formData.hasEquipment === true ? 'Yes' : formData.hasEquipment === false ? 'No' : 'N/A';
                addField('11. Do you have your own equipment?', hasEquip, 0, true);

                if (formData.hasEquipment && formData.equipmentDescription) {
                    addField('   List your equipment', formData.equipmentDescription, 0, true);
                }

                yPos += 3;
            });

            // Availability & Commitment Section
            drawSection('Availability & Commitment', () => {
                addField('12. How often can you volunteer?', formData.volunteerFrequency || 'N/A', 0, true);

                const times = formData.preferredTimes.length > 0 ? formData.preferredTimes.join(', ') : 'N/A';
                addField('13. Preferred Days/Times for Service (Check all that apply)', times, 0, true);

                const willing = formData.willingToTrain === true ? 'Yes' : formData.willingToTrain === false ? 'No' : 'N/A';
                addField('14. Are you willing to attend media team training sessions?', willing, 0, true);

                yPos += 3;
            });

            // Spiritual & Volunteer Commitment Section
            drawSection('Spiritual & Volunteer Commitment', () => {
                addField('15. Why do you want to join the ACK Mombasa Media Team?', formData.motivation || 'N/A', 0, true);

                const commitment = formData.commitmentDeclaration ? 'Yes, I commit' : 'Not confirmed';
                addField('16. Do you commit to serving with integrity, teamwork, and dedication?', commitment, 0, true);

                yPos += 3;
            });

            // Emergency Contact Section
            drawSection('Emergency Contact', () => {
                addField('17. Emergency Contact Name', formData.emergencyContactName || 'N/A', 0, true);
                addField('18. Relationship', formData.emergencyContactRelationship || 'N/A', 0, true);
                addField('19. Emergency Contact Phone', formData.emergencyContactPhone || 'N/A', 0, true);

                yPos += 3;
            });

            // Bible verse footer
            checkNewPage(25);
            pdf.setFillColor(249, 250, 251);
            pdf.setDrawColor(209, 213, 219);
            pdf.rect(leftMargin, yPos, contentWidth, 18, 'FD');

            pdf.setTextColor(75, 85, 99);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            const verse = '"Each of you should use whatever gift you have received to serve others, as faithful stewards of God\'s grace."';
            pdf.text(verse, pageWidth / 2, yPos + 8, { align: 'center', maxWidth: contentWidth - 10 });
            pdf.setFont('helvetica', 'normal');
            pdf.text('– 1 Peter 4:10', pageWidth / 2, yPos + 14, { align: 'center' });

            pdf.save(`ACK_Media_Team_Registration_${formData.fullName || 'Form'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadDOCX = async () => {
        setIsDownloading(true);
        try {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: 'ACK MOMBASA MEMORIAL CATHEDRAL',
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            text: 'MEDIA TEAM REGISTRATION FORM',
                            heading: HeadingLevel.HEADING_2,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({ text: '' }),

                        // Personal Information
                        new Paragraph({
                            text: 'PERSONAL INFORMATION',
                            heading: HeadingLevel.HEADING_3,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '1. Full Name: ', bold: true }),
                                new TextRun(formData.fullName || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '2. Gender: ', bold: true }),
                                new TextRun(formData.gender || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '3. Age: ', bold: true }),
                                new TextRun(formData.age || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '4. Marital Status: ', bold: true }),
                                new TextRun(formData.maritalStatus || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '5. Phone Number: ', bold: true }),
                                new TextRun(formData.phoneNumber || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '6. Email Address: ', bold: true }),
                                new TextRun(formData.email || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '7. Residential Address: ', bold: true }),
                                new TextRun(formData.residentialAddress || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '8. Are you a member of ACK Mombasa Memorial Cathedral? ', bold: true }),
                                new TextRun(formData.isMember === true ? 'Yes' : formData.isMember === false ? 'No' : 'N/A'),
                            ],
                        }),
                        ...(formData.isMember ? [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: '   Membership Number: ', bold: true }),
                                    new TextRun(formData.membershipNumber || 'N/A'),
                                ],
                            }),
                        ] : formData.isMember === false ? [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: '   Church You Attend: ', bold: true }),
                                    new TextRun(formData.otherChurch || 'N/A'),
                                ],
                            }),
                        ] : []),
                        new Paragraph({ text: '' }),

                        // Media Team Skills & Interests
                        new Paragraph({
                            text: 'MEDIA TEAM SKILLS & INTERESTS',
                            heading: HeadingLevel.HEADING_3,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '9. Media team roles interested in: ', bold: true }),
                                new TextRun(formData.mediaRoles.length > 0 ? formData.mediaRoles.join(', ') : 'N/A'),
                            ],
                        }),
                        ...(formData.otherRole ? [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: '   Other role: ', bold: true }),
                                    new TextRun(formData.otherRole),
                                ],
                            }),
                        ] : []),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '10. Prior experience in media work? ', bold: true }),
                                new TextRun(formData.hasExperience === true ? 'Yes' : formData.hasExperience === false ? 'No' : 'N/A'),
                            ],
                        }),
                        ...(formData.hasExperience ? [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: '    Experience: ', bold: true }),
                                    new TextRun(formData.experienceDescription || 'N/A'),
                                ],
                            }),
                        ] : []),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '11. Do you have your own equipment? ', bold: true }),
                                new TextRun(formData.hasEquipment === true ? 'Yes' : formData.hasEquipment === false ? 'No' : 'N/A'),
                            ],
                        }),
                        ...(formData.hasEquipment ? [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: '    Equipment: ', bold: true }),
                                    new TextRun(formData.equipmentDescription || 'N/A'),
                                ],
                            }),
                        ] : []),
                        new Paragraph({ text: '' }),

                        // Availability & Commitment
                        new Paragraph({
                            text: 'AVAILABILITY & COMMITMENT',
                            heading: HeadingLevel.HEADING_3,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '12. How often can you volunteer? ', bold: true }),
                                new TextRun(formData.volunteerFrequency || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '13. Preferred Days/Times: ', bold: true }),
                                new TextRun(formData.preferredTimes.length > 0 ? formData.preferredTimes.join(', ') : 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '14. Willing to attend training sessions? ', bold: true }),
                                new TextRun(formData.willingToTrain === true ? 'Yes' : formData.willingToTrain === false ? 'No' : 'N/A'),
                            ],
                        }),
                        new Paragraph({ text: '' }),

                        // Spiritual & Volunteer Commitment
                        new Paragraph({
                            text: 'SPIRITUAL & VOLUNTEER COMMITMENT',
                            heading: HeadingLevel.HEADING_3,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '15. Why do you want to join the ACK Mombasa Media Team? ', bold: true }),
                            ],
                        }),
                        new Paragraph({
                            text: formData.motivation || 'N/A',
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '16. Commitment to serve with integrity, teamwork, and dedication: ', bold: true }),
                                new TextRun(formData.commitmentDeclaration ? 'Yes, I commit' : 'Not confirmed'),
                            ],
                        }),
                        new Paragraph({ text: '' }),

                        // Emergency Contact
                        new Paragraph({
                            text: 'EMERGENCY CONTACT',
                            heading: HeadingLevel.HEADING_3,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '17. Emergency Contact Name: ', bold: true }),
                                new TextRun(formData.emergencyContactName || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '18. Relationship: ', bold: true }),
                                new TextRun(formData.emergencyContactRelationship || 'N/A'),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: '19. Emergency Contact Phone: ', bold: true }),
                                new TextRun(formData.emergencyContactPhone || 'N/A'),
                            ],
                        }),
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `ACK_Media_Team_Registration_${formData.fullName || 'Form'}.docx`);
        } catch (error) {
            console.error('Error generating DOCX:', error);
            alert('Failed to generate DOCX. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto p-8 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-3xl font-bold text-green-800 mb-4">Registration Successful!</h2>
                    <p className="text-green-700 mb-2">
                        Thank you for your interest in joining the ACK Mombasa Memorial Cathedral Media Team!
                    </p>
                    <p className="text-green-700 mb-6">
                        We have received your application and will review it soon. You will receive a confirmation email shortly.
                    </p>
                    <Button onClick={() => {
                        setSuccess(false);
                        window.location.reload();
                    }} variant="primary">
                        Submit Another Application
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            {/* Introduction */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border-l-4 border-purple-600">
                <p className="font-semibold text-gray-800 mb-2">Thank you for your interest in joining the ACK Mombasa Memorial Cathedral Media Team!</p>
                <p className="text-gray-700">Your skills and dedication will help us spread the Gospel, document church activities, and enhance our digital presence. Please complete this form to register as a volunteer.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Personal Information */}
            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-600">Personal Information</h2>

                <div className="space-y-6">
                    <Input
                        label="1. Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                    />

                    <div className="grid md:grid-cols-3 gap-6">
                        <Input
                            label="2. Gender"
                            name="gender"
                            as="select"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                            options={[
                                { value: '', label: 'Select' },
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                            ]}
                        />

                        <Input
                            label="3. Age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="Enter age"
                            required
                            min="16"
                            max="100"
                        />

                        <Input
                            label="4. Marital Status"
                            name="maritalStatus"
                            as="select"
                            value={formData.maritalStatus}
                            onChange={handleInputChange}
                            options={[
                                { value: '', label: 'Select Status' },
                                { value: 'single', label: 'Single' },
                                { value: 'married', label: 'Married' },
                                { value: 'divorced', label: 'Divorced' },
                                { value: 'widowed', label: 'Widowed' },
                            ]}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="5. Phone Number"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="+254..."
                            required
                        />

                        <Input
                            label="6. Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>

                    <Input
                        label="7. Residential Address"
                        name="residentialAddress"
                        as="textarea"
                        value={formData.residentialAddress}
                        onChange={handleInputChange}
                        placeholder="Street, Area, City"
                        rows={2}
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            8. Are you a member of ACK Mombasa Memorial Cathedral? <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="isMember"
                                    value="yes"
                                    checked={formData.isMember === true}
                                    onChange={() => setFormData({ ...formData, isMember: true })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="isMember"
                                    value="no"
                                    checked={formData.isMember === false}
                                    onChange={() => setFormData({ ...formData, isMember: false })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">No</span>
                            </label>
                        </div>

                        {formData.isMember && (
                            <Input
                                label="Membership Number"
                                name="membershipNumber"
                                value={formData.membershipNumber}
                                onChange={handleInputChange}
                                placeholder="Enter membership number"
                            />
                        )}

                        {!formData.isMember && formData.isMember !== undefined && (
                            <Input
                                label="Church You Attend"
                                name="otherChurch"
                                value={formData.otherChurch}
                                onChange={handleInputChange}
                                placeholder="Enter church name"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Media Team Skills & Interests */}
            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-600">Media Team Skills & Interests</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            9. Which media team roles are you interested in? (Check all that apply) <span className="text-red-500">*</span>
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                            {mediaRolesOptions.map((role) => (
                                <label key={role} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="mediaRoles"
                                        value={role}
                                        checked={formData.mediaRoles.includes(role)}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{role}</span>
                                </label>
                            ))}
                        </div>
                        <Input
                            label="Other (Please specify)"
                            name="otherRole"
                            value={formData.otherRole}
                            onChange={handleInputChange}
                            placeholder="Specify other role"
                            className="mt-4"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            10. Do you have prior experience in media work? <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="hasExperience"
                                    value="yes"
                                    checked={formData.hasExperience === true}
                                    onChange={() => setFormData({ ...formData, hasExperience: true })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="hasExperience"
                                    value="no"
                                    checked={formData.hasExperience === false}
                                    onChange={() => setFormData({ ...formData, hasExperience: false })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">No</span>
                            </label>
                        </div>

                        {formData.hasExperience && (
                            <Input
                                label="Please describe your experience"
                                name="experienceDescription"
                                as="textarea"
                                value={formData.experienceDescription}
                                onChange={handleInputChange}
                                placeholder="Describe your media experience, previous roles, projects, etc."
                                rows={3}
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            11. Do you have your own equipment? (Camera, laptop, editing software, etc.)
                        </label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="hasEquipment"
                                    value="yes"
                                    checked={formData.hasEquipment === true}
                                    onChange={() => setFormData({ ...formData, hasEquipment: true })}
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="hasEquipment"
                                    value="no"
                                    checked={formData.hasEquipment === false}
                                    onChange={() => setFormData({ ...formData, hasEquipment: false })}
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">No</span>
                            </label>
                        </div>

                        {formData.hasEquipment && (
                            <Input
                                label="List your equipment"
                                name="equipmentDescription"
                                as="textarea"
                                value={formData.equipmentDescription}
                                onChange={handleInputChange}
                                placeholder="List cameras, laptops, software, and other equipment you have"
                                rows={3}
                                required
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Availability & Commitment */}
            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-600">Availability & Commitment</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            12. How often can you volunteer? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                            {['Weekly', 'Bi-weekly', 'Monthly', 'Special Events Only'].map((freq) => (
                                <label key={freq} className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                    <input
                                        type="radio"
                                        name="volunteerFrequency"
                                        value={freq}
                                        checked={formData.volunteerFrequency === freq}
                                        onChange={handleInputChange}
                                        required
                                        className="w-4 h-4 text-purple-600"
                                    />
                                    <span className="text-sm text-gray-700">{freq}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            13. Preferred Days/Times for Service (Check all that apply)
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                            {preferredTimesOptions.map((time) => (
                                <label key={time} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="preferredTimes"
                                        value={time}
                                        checked={formData.preferredTimes.includes(time)}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{time}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            14. Are you willing to attend media team training sessions? <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="willingToTrain"
                                    value="yes"
                                    checked={formData.willingToTrain === true}
                                    onChange={() => setFormData({ ...formData, willingToTrain: true })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                                <input
                                    type="radio"
                                    name="willingToTrain"
                                    value="no"
                                    checked={formData.willingToTrain === false}
                                    onChange={() => setFormData({ ...formData, willingToTrain: false })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm text-gray-700">No</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spiritual & Volunteer Commitment */}
            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-600">Spiritual & Volunteer Commitment</h2>

                <div className="space-y-6">
                    <Input
                        label="15. Why do you want to join the ACK Mombasa Media Team?"
                        name="motivation"
                        as="textarea"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        placeholder="Share your motivation and how you hope to contribute to the ministry"
                        rows={4}
                        required
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            16. Do you commit to serving with integrity, teamwork, and dedication? <span className="text-red-500">*</span>
                        </label>
                        <label className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-purple-50">
                            <input
                                type="checkbox"
                                name="commitmentDeclaration"
                                checked={formData.commitmentDeclaration}
                                onChange={handleInputChange}
                                required
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-semibold text-gray-700">Yes, I commit</span>
                        </label>
                    </div>
                </div>
            </section>

            {/* Emergency Contact */}
            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-600">Emergency Contact</h2>

                <div className="grid md:grid-cols-3 gap-6">
                    <Input
                        label="17. Emergency Contact Name"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        placeholder="Full name"
                        required
                    />

                    <Input
                        label="18. Relationship"
                        name="emergencyContactRelationship"
                        value={formData.emergencyContactRelationship}
                        onChange={handleInputChange}
                        placeholder="e.g., Spouse, Parent, Sibling"
                        required
                    />

                    <Input
                        label="19. Emergency Contact Phone"
                        name="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        placeholder="+254..."
                        required
                    />
                </div>
            </section>

            {/* Bible Verse */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-lg font-semibold text-gray-800 italic mb-2">
                    "Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace."
                </p>
                <p className="text-gray-600">– 1 Peter 4:10</p>
            </div>

            <div className="text-center text-xl font-semibold text-gray-800">
                Thank you for your willingness to serve!
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pb-8">
                {/* Submit Button */}
                <div className="flex justify-center">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full md:w-auto md:px-16 text-lg py-4"
                    >
                        {isLoading ? 'Submitting...' : '📤 Submit Form'}
                    </Button>
                </div>

                {/* Download and Print Options */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Button
                        type="button"
                        onClick={handleDownloadPDF}
                        isLoading={isDownloading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                    >
                        📄 Download as PDF
                    </Button>

                    <Button
                        type="button"
                        onClick={handleDownloadDOCX}
                        isLoading={isDownloading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                        📝 Download as DOCX
                    </Button>

                    <Button
                        type="button"
                        onClick={handlePrint}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    >
                        🖨️ Print Form
                    </Button>
                </div>
            </div>
        </form>
    );
}
