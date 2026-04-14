'use client';

import { useState, useRef } from 'react';
import { submissionsAPI } from '@/lib/api';
import Input from './ui/Input';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
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
            let yPos = 0;
            const leftMargin = 14;
            const contentWidth = pageWidth - leftMargin * 2;

            // ── Colour palette ──────────────────────────────────────────────
            const C_PURPLE_DARK  = [30, 27, 75] as [number,number,number];   // #1e1b4b
            const C_PURPLE       = [109, 40, 217] as [number,number,number];  // #6d28d9
            const C_PURPLE_LIGHT = [245, 243, 255] as [number,number,number]; // #f5f3ff
            const C_GOLD         = [217, 119, 6] as [number,number,number];   // #d97706
            const C_GOLD_LIGHT   = [254, 243, 199] as [number,number,number]; // #fef3c7
            const C_GRAY_900     = [17, 24, 39] as [number,number,number];
            const C_GRAY_600     = [75, 85, 99] as [number,number,number];
            const C_GRAY_200     = [229, 231, 235] as [number,number,number];
            const C_ROW_ALT      = [249, 250, 251] as [number,number,number];

            const newPage = () => {
                pdf.addPage();
                yPos = 14;
            };
            const checkPage = (need: number = 28) => {
                if (yPos + need > pageHeight - 18) newPage();
            };

            // ── HEADER ──────────────────────────────────────────────────────
            // Dark purple background
            pdf.setFillColor(...C_PURPLE_DARK);
            pdf.rect(0, 0, pageWidth, 46, 'F');
            // Gold accent stripe at top
            pdf.setFillColor(...C_GOLD);
            pdf.rect(0, 0, pageWidth, 3, 'F');

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(15);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ACK MOMBASA MEMORIAL CATHEDRAL', pageWidth / 2, 18, { align: 'center' });

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(253, 230, 138); // amber-200
            pdf.text('MEDIA TEAM REGISTRATION FORM', pageWidth / 2, 28, { align: 'center' });

            // Submission meta line
            pdf.setFontSize(8);
            pdf.setTextColor(196, 181, 253); // purple-300
            const submittedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            pdf.text(`Date: ${submittedDate}   |   Applicant: ${formData.fullName || '—'}`, pageWidth / 2, 39, { align: 'center' });

            yPos = 54;

            // ── Intro banner ────────────────────────────────────────────────
            pdf.setFillColor(...C_PURPLE_LIGHT);
            pdf.setDrawColor(...C_PURPLE);
            pdf.setLineWidth(0.4);
            pdf.roundedRect(leftMargin, yPos, contentWidth, 16, 2, 2, 'FD');
            // Gold left accent bar
            pdf.setFillColor(...C_GOLD);
            pdf.rect(leftMargin, yPos, 3, 16, 'F');

            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(8.5);
            pdf.setTextColor(...C_GRAY_600);
            const introLines = pdf.splitTextToSize(
                'Thank you for your interest in joining the ACK Mombasa Memorial Cathedral Media Team. Your skills and dedication will help us spread the Gospel, document church activities, and enhance our digital presence.',
                contentWidth - 14
            );
            pdf.text(introLines, leftMargin + 7, yPos + 6);
            yPos += 22;

            // ── Section helpers ─────────────────────────────────────────────
            const drawSectionHeader = (title: string, icon: string) => {
                checkPage(14);
                pdf.setFillColor(...C_PURPLE);
                pdf.rect(leftMargin, yPos, contentWidth, 10, 'F');
                // Gold left bar
                pdf.setFillColor(...C_GOLD);
                pdf.rect(leftMargin, yPos, 3, 10, 'F');

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(9.5);
                pdf.setTextColor(255, 255, 255);
                pdf.text(`${icon}  ${title.toUpperCase()}`, leftMargin + 7, yPos + 7);
                yPos += 13;
            };

            let rowIndex = 0;
            const addRow = (label: string, value: string, fullWidth = true) => {
                const valText = value || '—';
                const labelLines = pdf.splitTextToSize(label, contentWidth * 0.38);
                const valueLines = pdf.splitTextToSize(valText, contentWidth * 0.56);
                const lineCount = Math.max(labelLines.length, valueLines.length);
                const rowH = Math.max(10, lineCount * 5 + 4);
                checkPage(rowH + 2);

                if (rowIndex % 2 === 0) {
                    pdf.setFillColor(...C_ROW_ALT);
                    pdf.rect(leftMargin, yPos, contentWidth, rowH, 'F');
                }
                rowIndex++;

                // Label
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8.5);
                pdf.setTextColor(...C_GRAY_600);
                pdf.text(labelLines, leftMargin + 4, yPos + 6);

                // Value
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(9.5);
                pdf.setTextColor(...C_GRAY_900);
                pdf.text(valueLines, leftMargin + contentWidth * 0.42, yPos + 6);

                // Row divider
                pdf.setDrawColor(...C_GRAY_200);
                pdf.setLineWidth(0.2);
                pdf.line(leftMargin, yPos + rowH, leftMargin + contentWidth, yPos + rowH);

                yPos += rowH;
            };

            const endSection = () => {
                // Outer border around section rows
                rowIndex = 0;
                yPos += 6;
            };

            // ── PERSONAL INFORMATION ────────────────────────────────────────
            drawSectionHeader('Personal Information', '01');
            rowIndex = 0;
            addRow('Full Name', formData.fullName);
            addRow('Gender', formData.gender || '—');
            addRow('Age', formData.age || 'Not provided');
            addRow('Marital Status', formData.maritalStatus || '—');
            addRow('Phone Number', formData.phoneNumber);
            addRow('Email Address', formData.email);
            addRow('Residential Address', formData.residentialAddress || '—');
            const memberStatus = formData.isMember === true ? 'Yes — ACK member' : formData.isMember === false ? 'No' : '—';
            addRow('ACK Mombasa Cathedral Member?', memberStatus);
            if (formData.isMember && formData.membershipNumber)
                addRow('Membership Number', formData.membershipNumber);
            if (formData.isMember === false && formData.otherChurch)
                addRow('Church Attended', formData.otherChurch);
            endSection();

            // ── MEDIA SKILLS & INTERESTS ────────────────────────────────────
            drawSectionHeader('Media Team Skills & Interests', '02');
            rowIndex = 0;
            addRow('Roles Interested In', formData.mediaRoles.length > 0 ? formData.mediaRoles.join(', ') : '—');
            if (formData.otherRole) addRow('Other Role', formData.otherRole);
            const hasExp = formData.hasExperience === true ? 'Yes' : formData.hasExperience === false ? 'No' : '—';
            addRow('Prior Media Experience?', hasExp);
            if (formData.hasExperience && formData.experienceDescription)
                addRow('Experience Details', formData.experienceDescription);
            const hasEquip = formData.hasEquipment === true ? 'Yes' : formData.hasEquipment === false ? 'No' : '—';
            addRow('Own Equipment?', hasEquip);
            if (formData.hasEquipment && formData.equipmentDescription)
                addRow('Equipment Details', formData.equipmentDescription);
            endSection();

            // ── AVAILABILITY & COMMITMENT ───────────────────────────────────
            drawSectionHeader('Availability & Commitment', '03');
            rowIndex = 0;
            addRow('Volunteer Frequency', formData.volunteerFrequency || '—');
            addRow('Preferred Times', formData.preferredTimes.length > 0 ? formData.preferredTimes.join(', ') : '—');
            const willing = formData.willingToTrain === true ? 'Yes' : formData.willingToTrain === false ? 'No' : '—';
            addRow('Willing to Attend Training?', willing);
            endSection();

            // ── SPIRITUAL & VOLUNTEER COMMITMENT ───────────────────────────
            drawSectionHeader('Spiritual & Volunteer Commitment', '04');
            rowIndex = 0;
            addRow('Motivation to Join', formData.motivation || '—');
            addRow('Commitment Declaration', formData.commitmentDeclaration ? 'Yes — I commit to serve with integrity, teamwork, and dedication' : 'Not confirmed');
            endSection();

            // ── EMERGENCY CONTACT ───────────────────────────────────────────
            drawSectionHeader('Emergency Contact', '05');
            rowIndex = 0;
            addRow('Contact Name', formData.emergencyContactName || '—');
            addRow('Relationship', formData.emergencyContactRelationship || '—');
            addRow('Contact Phone', formData.emergencyContactPhone || '—');
            endSection();

            // ── FOOTER ──────────────────────────────────────────────────────
            checkPage(22);
            pdf.setFillColor(...C_GOLD_LIGHT);
            pdf.setDrawColor(...C_GOLD);
            pdf.setLineWidth(0.4);
            pdf.roundedRect(leftMargin, yPos, contentWidth, 18, 2, 2, 'FD');
            pdf.setFillColor(...C_GOLD);
            pdf.rect(leftMargin, yPos, 3, 18, 'F');

            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(8.5);
            pdf.setTextColor(...C_GRAY_600);
            pdf.text(
                '"Each of you should use whatever gift you have received to serve others, as faithful stewards of God\'s grace."',
                pageWidth / 2, yPos + 8, { align: 'center', maxWidth: contentWidth - 14 }
            );
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(...C_GOLD);
            pdf.text('— 1 Peter 4:10', pageWidth / 2, yPos + 14, { align: 'center' });

            // Page number
            const totalPages = (pdf as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7.5);
                pdf.setTextColor(156, 163, 175);
                pdf.text(`Page ${i} of ${totalPages}`, pageWidth - leftMargin, pageHeight - 8, { align: 'right' });
                pdf.text('ACK Mombasa Memorial Cathedral — Media Team', leftMargin, pageHeight - 8);
            }

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
            const PURPLE = '1E1B4B';
            const GOLD   = 'D97706';
            const GRAY   = '6B7280';

            // Section heading paragraph
            const sectionHeading = (label: string) => new Paragraph({
                children: [new TextRun({ text: label.toUpperCase(), bold: true, color: 'FFFFFF', size: 22, font: 'Calibri' })],
                spacing: { before: 280, after: 0 },
                shading: { type: 'solid', color: PURPLE, fill: PURPLE } as any,
                indent: { left: 120, right: 120 },
                border: {
                    top: { style: BorderStyle.SINGLE, size: 12, color: GOLD },
                    left: { style: BorderStyle.SINGLE, size: 20, color: GOLD },
                    bottom: { style: BorderStyle.NONE, size: 0, color: PURPLE },
                    right: { style: BorderStyle.NONE, size: 0, color: PURPLE },
                },
            });

            // Field row: bold label then value on same line
            const field = (label: string, value: string) => new Paragraph({
                children: [
                    new TextRun({ text: `${label}:  `, bold: true, color: GRAY, size: 20, font: 'Calibri' }),
                    new TextRun({ text: value || '—', color: '111827', size: 20, font: 'Calibri' }),
                ],
                spacing: { before: 80, after: 80 },
                indent: { left: 240, right: 240 },
                border: {
                    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
                },
            });

            const gap = () => new Paragraph({ text: '', spacing: { before: 0, after: 0 } });

            const memberStatus = formData.isMember === true ? 'Yes — ACK Mombasa Cathedral member' : formData.isMember === false ? 'No' : '—';
            const hasExp  = formData.hasExperience === true ? 'Yes' : formData.hasExperience === false ? 'No' : '—';
            const hasEquip = formData.hasEquipment === true ? 'Yes' : formData.hasEquipment === false ? 'No' : '—';
            const willing  = formData.willingToTrain === true ? 'Yes' : formData.willingToTrain === false ? 'No' : '—';

            const doc = new Document({
                sections: [{
                    properties: {
                        page: { margin: { top: 800, bottom: 800, left: 1000, right: 1000 } },
                    },
                    children: [
                        // ── Title ────────────────────────────────────────────
                        new Paragraph({
                            children: [new TextRun({ text: 'ACK MOMBASA MEMORIAL CATHEDRAL', bold: true, size: 30, color: PURPLE, font: 'Calibri' })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 80 },
                            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD } },
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: 'MEDIA TEAM REGISTRATION FORM', bold: true, size: 24, color: GOLD, font: 'Calibri' })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 80, after: 60 },
                        }),
                        new Paragraph({
                            children: [new TextRun({
                                text: `Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}   |   Applicant: ${formData.fullName || '—'}`,
                                italics: true, size: 18, color: GRAY, font: 'Calibri',
                            })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 200 },
                        }),

                        // ── 01 Personal Information ───────────────────────────
                        sectionHeading('01  Personal Information'),
                        field('Full Name', formData.fullName),
                        field('Gender', formData.gender || '—'),
                        field('Age', formData.age || 'Not provided'),
                        field('Marital Status', formData.maritalStatus || '—'),
                        field('Phone Number', formData.phoneNumber),
                        field('Email Address', formData.email),
                        field('Residential Address', formData.residentialAddress || '—'),
                        field('ACK Cathedral Member?', memberStatus),
                        ...(formData.isMember && formData.membershipNumber ? [field('Membership Number', formData.membershipNumber)] : []),
                        ...(formData.isMember === false && formData.otherChurch ? [field('Church Attended', formData.otherChurch)] : []),

                        // ── 02 Media Skills ───────────────────────────────────
                        sectionHeading('02  Media Team Skills & Interests'),
                        field('Roles Interested In', formData.mediaRoles.length > 0 ? formData.mediaRoles.join(', ') : '—'),
                        ...(formData.otherRole ? [field('Other Role', formData.otherRole)] : []),
                        field('Prior Media Experience?', hasExp),
                        ...(formData.hasExperience && formData.experienceDescription ? [field('Experience Details', formData.experienceDescription)] : []),
                        field('Own Equipment?', hasEquip),
                        ...(formData.hasEquipment && formData.equipmentDescription ? [field('Equipment Details', formData.equipmentDescription)] : []),

                        // ── 03 Availability ───────────────────────────────────
                        sectionHeading('03  Availability & Commitment'),
                        field('Volunteer Frequency', formData.volunteerFrequency || '—'),
                        field('Preferred Times', formData.preferredTimes.length > 0 ? formData.preferredTimes.join(', ') : '—'),
                        field('Willing to Attend Training?', willing),

                        // ── 04 Spiritual Commitment ───────────────────────────
                        sectionHeading('04  Spiritual & Volunteer Commitment'),
                        field('Motivation to Join', formData.motivation || '—'),
                        field('Commitment Declaration', formData.commitmentDeclaration ? 'Yes — I commit to serve with integrity, teamwork, and dedication' : 'Not confirmed'),

                        // ── 05 Emergency Contact ──────────────────────────────
                        sectionHeading('05  Emergency Contact'),
                        field('Contact Name', formData.emergencyContactName || '—'),
                        field('Relationship', formData.emergencyContactRelationship || '—'),
                        field('Contact Phone', formData.emergencyContactPhone || '—'),

                        // ── Footer ────────────────────────────────────────────
                        gap(),
                        new Paragraph({
                            children: [new TextRun({
                                text: '"Each of you should use whatever gift you have received to serve others, as faithful stewards of God\'s grace." — 1 Peter 4:10',
                                italics: true, size: 17, color: '92400E', font: 'Calibri',
                            })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 280, after: 0 },
                            border: { top: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
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
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
                    <p className="text-gray-500 mb-2">
                        Thank you for your interest in the ACK Mombasa Memorial Cathedral Media Team.
                    </p>
                    <p className="text-gray-500 mb-8">
                        We&apos;ve received your application and will be in touch soon via email.
                    </p>
                    <button
                        onClick={() => { setSuccess(false); window.location.reload(); }}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                    >
                        Submit Another Application
                    </button>
                </div>
                <p className="text-center text-gray-400 text-sm mt-6 italic">
                    &quot;Each of you should use whatever gift you have received to serve others.&quot; — 1 Peter 4:10
                </p>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Introduction */}
            <div className="bg-purple-600 text-white p-5 rounded-2xl flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="font-semibold mb-1">Welcome — we&apos;re glad you&apos;re here!</p>
                    <p className="text-white/80 text-sm leading-relaxed">Your skills and dedication will help us spread the Gospel, document church activities, and enhance our digital presence. Please complete all required fields marked with <span className="text-yellow-300 font-bold">*</span>.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Personal Information */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                </div>
                <div className="p-6 space-y-6">
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
                            label="3. Age (Optional)"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="Enter age"
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
                        <div className="flex gap-3 mb-4">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.isMember === true ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input
                                    type="radio"
                                    name="isMember"
                                    value="yes"
                                    checked={formData.isMember === true}
                                    onChange={() => setFormData({ ...formData, isMember: true })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm font-medium">Yes</span>
                            </label>
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.isMember === false ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input
                                    type="radio"
                                    name="isMember"
                                    value="no"
                                    checked={formData.isMember === false}
                                    onChange={() => setFormData({ ...formData, isMember: false })}
                                    required
                                    className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm font-medium">No</span>
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
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Media Team Skills &amp; Interests</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            9. Which media team roles are you interested in? (Check all that apply) <span className="text-red-500">*</span>
                        </label>
                        <div className="grid md:grid-cols-2 gap-2">
                            {mediaRolesOptions.map((role) => (
                                <label key={role} className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.mediaRoles.includes(role) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                    <input
                                        type="checkbox"
                                        name="mediaRoles"
                                        value={role}
                                        checked={formData.mediaRoles.includes(role)}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium">{role}</span>
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
                        <div className="flex gap-3 mb-4">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.hasExperience === true ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input type="radio" name="hasExperience" value="yes" checked={formData.hasExperience === true} onChange={() => setFormData({ ...formData, hasExperience: true })} required className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">Yes</span>
                            </label>
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.hasExperience === false ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input type="radio" name="hasExperience" value="no" checked={formData.hasExperience === false} onChange={() => setFormData({ ...formData, hasExperience: false })} required className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">No</span>
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
                        <div className="flex gap-3 mb-4">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.hasEquipment === true ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input type="radio" name="hasEquipment" value="yes" checked={formData.hasEquipment === true} onChange={() => setFormData({ ...formData, hasEquipment: true })} className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">Yes</span>
                            </label>
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.hasEquipment === false ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input type="radio" name="hasEquipment" value="no" checked={formData.hasEquipment === false} onChange={() => setFormData({ ...formData, hasEquipment: false })} className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">No</span>
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
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Availability &amp; Commitment</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            12. How often can you volunteer? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid md:grid-cols-2 gap-2">
                            {['Weekly', 'Bi-weekly', 'Monthly', 'Special Events Only'].map((freq) => (
                                <label key={freq} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.volunteerFrequency === freq ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                    <input type="radio" name="volunteerFrequency" value={freq} checked={formData.volunteerFrequency === freq} onChange={handleInputChange} required className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium">{freq}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            13. Preferred Days/Times for Service (Check all that apply)
                        </label>
                        <div className="grid md:grid-cols-2 gap-2">
                            {preferredTimesOptions.map((time) => (
                                <label key={time} className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.preferredTimes.includes(time) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                    <input type="checkbox" name="preferredTimes" value={time} checked={formData.preferredTimes.includes(time)} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                                    <span className="text-sm font-medium">{time}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            14. Are you willing to attend media team training sessions? <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.willingToTrain === true ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input type="radio" name="willingToTrain" value="yes" checked={formData.willingToTrain === true} onChange={() => setFormData({ ...formData, willingToTrain: true })} required className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">Yes</span>
                            </label>
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${formData.willingToTrain === false ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'}`}>
                                <input type="radio" name="willingToTrain" value="no" checked={formData.willingToTrain === false} onChange={() => setFormData({ ...formData, willingToTrain: false })} required className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">No</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spiritual & Volunteer Commitment */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Spiritual &amp; Volunteer Commitment</h2>
                </div>
                <div className="p-6 space-y-6">
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
                        <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${formData.commitmentDeclaration ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50 hover:border-purple-300'}`}>
                            <input
                                type="checkbox"
                                name="commitmentDeclaration"
                                checked={formData.commitmentDeclaration}
                                onChange={handleInputChange}
                                required
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Yes, I commit to serving with integrity, teamwork, and dedication</span>
                        </label>
                    </div>
                </div>
            </section>

            {/* Emergency Contact */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
                </div>
                <div className="p-6">
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
                </div>
            </section>

            {/* Bible Verse */}
            <div className="bg-purple-600 rounded-2xl p-6 text-center">
                <p className="text-base font-medium text-white/90 italic mb-2 leading-relaxed">
                    &quot;Each of you should use whatever gift you have received to serve others,<br className="hidden md:block" /> as faithful stewards of God&apos;s grace.&quot;
                </p>
                <p className="text-yellow-300 text-sm font-medium">– 1 Peter 4:10</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pb-8">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 text-base"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Submitting…
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            Submit Application
                        </>
                    )}
                </button>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-700 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        PDF
                    </button>
                    <button
                        type="button"
                        onClick={handleDownloadDOCX}
                        disabled={isDownloading}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        DOCX
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-700 text-sm font-medium rounded-xl transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                    </button>
                </div>
            </div>
        </form>
    );
}
