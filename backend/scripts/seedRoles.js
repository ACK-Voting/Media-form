require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');

const defaultRoles = [
    {
        name: 'Media Manager',
        slug: 'media-manager',
        description: 'Oversees all media team operations and coordinates team activities',
        responsibilities: [
            'Coordinate team activities and meetings',
            'Oversee content creation and distribution',
            'Manage team resources and equipment',
            'Report to church leadership'
        ],
        permissions: [
            'view_calendar',
            'view_minutes',
            'upload_minutes',
            'edit_minutes',
            'delete_minutes',
            'create_events',
            'edit_events',
            'delete_events',
            'manage_users',
            'assign_roles',
            'create_content',
            'approve_registrations'
        ]
    },
    {
        name: 'Photographer',
        slug: 'photographer',
        description: 'Captures high-quality photographs of church events and services',
        responsibilities: [
            'Take photos during services and events',
            'Edit and organize photo collections',
            'Maintain photography equipment',
            'Coordinate with other team members'
        ],
        permissions: ['view_calendar', 'view_minutes', 'create_content']
    },
    {
        name: 'Videographer',
        slug: 'videographer',
        description: 'Records video footage of church services and special events',
        responsibilities: [
            'Record video during services and events',
            'Operate camera equipment professionally',
            'Coordinate with live streaming team',
            'Maintain video equipment'
        ],
        permissions: ['view_calendar', 'view_minutes', 'create_content']
    },
    {
        name: 'Video Editor',
        slug: 'video-editor',
        description: 'Edits and produces final video content for distribution',
        responsibilities: [
            'Edit recorded video footage',
            'Add graphics and transitions',
            'Color correction and audio mixing',
            'Export and deliver final videos'
        ],
        permissions: ['view_calendar', 'view_minutes', 'create_content']
    },
    {
        name: 'Graphic Designer',
        slug: 'graphic-designer',
        description: 'Creates visual content and graphics for church communications',
        responsibilities: [
            'Design promotional materials',
            'Create social media graphics',
            'Develop visual branding elements',
            'Support event marketing'
        ],
        permissions: ['view_calendar', 'view_minutes', 'create_content']
    },
    {
        name: 'Social Media Manager',
        slug: 'social-media-manager',
        description: 'Manages church social media presence and online engagement',
        responsibilities: [
            'Manage social media accounts',
            'Create and schedule posts',
            'Engage with online community',
            'Monitor social media analytics'
        ],
        permissions: ['view_calendar', 'view_minutes', 'create_content']
    },
    {
        name: 'Content Writer',
        slug: 'content-writer',
        description: 'Writes content for church communications and marketing materials',
        responsibilities: [
            'Write blog posts and articles',
            'Create social media captions',
            'Draft announcements and newsletters',
            'Proofread and edit content'
        ],
        permissions: ['view_calendar', 'view_minutes', 'create_content']
    },
    {
        name: 'Secretary',
        slug: 'secretary',
        description: 'Documents meetings and manages team records',
        responsibilities: [
            'Take meeting minutes',
            'Upload meeting documentation',
            'Maintain team records',
            'Coordinate team communications'
        ],
        permissions: ['view_calendar', 'view_minutes', 'upload_minutes', 'edit_minutes']
    },
    {
        name: 'Live Streaming Operator',
        slug: 'live-streaming-operator',
        description: 'Manages live stream broadcasts of church services',
        responsibilities: [
            'Set up and operate streaming equipment',
            'Monitor stream quality during broadcasts',
            'Troubleshoot technical issues',
            'Coordinate with videographers and audio team'
        ],
        permissions: ['view_calendar', 'view_minutes']
    }
];

async function seedRoles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ Connected to MongoDB');

        // Clear existing roles (optional - comment out if you want to keep existing)
        // await Role.deleteMany({});
        // console.log('🗑️  Cleared existing roles');

        // Insert roles
        for (const roleData of defaultRoles) {
            const existingRole = await Role.findOne({ slug: roleData.slug });

            if (existingRole) {
                console.log(`⏭️  Role "${roleData.name}" already exists, skipping...`);
            } else {
                const role = new Role(roleData);
                await role.save();
                console.log(`✅ Created role: ${roleData.name}`);
            }
        }

        console.log('\n🎉 Role seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    }
}

seedRoles();
