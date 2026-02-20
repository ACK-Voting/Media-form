const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    // For development/testing, use Gmail or a service like Mailtrap
    // For production, use a proper email service like SendGrid, AWS SES, etc.

    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
            }
        });
    }

    // Default to SMTP configuration
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send confirmation email to applicant
const sendConfirmationEmail = async (registration) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"ACK Mombasa Media Team" <${process.env.EMAIL_USER}>`,
            to: registration.email,
            subject: 'Thank You for Registering - ACK Mombasa Media Team',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .highlight {
              background: #e3f2fd;
              padding: 15px;
              border-left: 4px solid #2196f3;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #2196f3;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ACK Mombasa Memorial Cathedral</h1>
            <p>Media Team Registration</p>
          </div>

          <div class="content">
            <h2>Dear ${registration.fullName},</h2>

            <p>Thank you for registering to join the <strong>ACK Mombasa Memorial Cathedral Media Team</strong>!</p>

            <p>We have successfully received your application and are excited about your interest in serving through media ministry.</p>

            <div class="highlight">
              <h3>What happens next?</h3>
              <ul>
                <li>Our team will review your application</li>
                <li>You will be contacted within 3-5 business days</li>
                <li>If approved, you'll be invited to an orientation session</li>
                <li>Training sessions will be scheduled based on your selected roles</li>
              </ul>
            </div>

            <h3>Your Registration Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${registration.fullName}</li>
              <li><strong>Email:</strong> ${registration.email}</li>
              <li><strong>Phone:</strong> ${registration.phone}</li>
              <li><strong>Interested Roles:</strong> ${registration.roles ? registration.roles.join(', ') : 'Not specified'}</li>
              <li><strong>Submitted:</strong> ${new Date(registration.submittedAt).toLocaleDateString()}</li>
            </ul>

            <div class="highlight">
              <p><strong>Bible Verse:</strong></p>
              <p style="font-style: italic;">"Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace." - 1 Peter 4:10</p>
            </div>

            <p>If you have any questions, please feel free to contact us at <strong>${process.env.EMAIL_USER}</strong> or call the church office.</p>

            <p>God bless you!</p>

            <p><strong>ACK Mombasa Memorial Cathedral Media Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ACK Mombasa Memorial Cathedral. All rights reserved.</p>
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
        return { success: false, error: error.message };
    }
};

// Send notification email to admin
const sendAdminNotification = async (registration) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"ACK Media Team System" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `New Media Team Registration - ${registration.fullName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #2196f3;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background: #e3f2fd;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🆕 New Registration Received</h2>
          </div>

          <div class="content">
            <p>A new volunteer has registered for the Media Team:</p>

            <table>
              <tr>
                <th>Field</th>
                <th>Details</th>
              </tr>
              <tr>
                <td><strong>Full Name</strong></td>
                <td>${registration.fullName}</td>
              </tr>
              <tr>
                <td><strong>Email</strong></td>
                <td>${registration.email}</td>
              </tr>
              <tr>
                <td><strong>Phone</strong></td>
                <td>${registration.phone}</td>
              </tr>
              <tr>
                <td><strong>Age</strong></td>
                <td>${registration.age}</td>
              </tr>
              <tr>
                <td><strong>Gender</strong></td>
                <td>${registration.gender}</td>
              </tr>
              <tr>
                <td><strong>Interested Roles</strong></td>
                <td>${registration.roles ? registration.roles.join(', ') : 'Not specified'}</td>
              </tr>
              <tr>
                <td><strong>Prior Experience</strong></td>
                <td>${registration.experience === 'yes' ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td><strong>Availability</strong></td>
                <td>${registration.frequency}</td>
              </tr>
              <tr>
                <td><strong>Submitted At</strong></td>
                <td>${new Date(registration.submittedAt).toLocaleString()}</td>
              </tr>
            </table>

            <p>Please log in to the admin dashboard to review the full application and approve or reject it.</p>

            <p><a href="${process.env.FRONTEND_URL}/admin-dashboard.html" style="display: inline-block; padding: 12px 30px; background: #2196f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Dashboard</a></p>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin notification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending admin notification:', error);
        return { success: false, error: error.message };
    }
};

// Send status update email when admin approves/rejects
const sendStatusUpdateEmail = async (registration) => {
    try {
        const transporter = createTransporter();

        const isApproved = registration.status === 'approved';
        const subject = isApproved
            ? 'Congratulations! Your Media Team Application is Approved'
            : 'Update on Your Media Team Application';

        const mailOptions = {
            from: `"ACK Mombasa Media Team" <${process.env.EMAIL_USER}>`,
            to: registration.email,
            subject: subject,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: ${isApproved ? '#4caf50' : '#ff9800'};
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .highlight {
              background: ${isApproved ? '#e8f5e9' : '#fff3e0'};
              padding: 15px;
              border-left: 4px solid ${isApproved ? '#4caf50' : '#ff9800'};
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${isApproved ? '🎉 Congratulations!' : '📋 Application Update'}</h1>
          </div>

          <div class="content">
            <h2>Dear ${registration.fullName},</h2>

            ${isApproved ? `
              <p>We are pleased to inform you that your application to join the <strong>ACK Mombasa Memorial Cathedral Media Team</strong> has been <strong style="color: #4caf50;">APPROVED</strong>!</p>

              <div class="highlight">
                <h3>Next Steps:</h3>
                <ul>
                  <li>You will receive a call or email with details about the orientation session</li>
                  <li>Please attend the scheduled orientation to learn more about the team</li>
                  <li>Training sessions will be arranged based on your selected roles</li>
                  <li>You'll be added to the team communication channels</li>
                </ul>
              </div>

              <p>We look forward to working with you in spreading the Gospel through media!</p>
            ` : `
              <p>Thank you for your interest in joining the <strong>ACK Mombasa Memorial Cathedral Media Team</strong>.</p>

              <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>

              <div class="highlight">
                <p>This does not diminish your value or your desire to serve. We encourage you to:</p>
                <ul>
                  <li>Continue developing your media skills</li>
                  <li>Consider other ministries where you can serve</li>
                  <li>Reapply in the future when positions become available</li>
                </ul>
              </div>

              <p>If you have questions, please contact the church office.</p>
            `}

            <p>God bless you!</p>

            <p><strong>ACK Mombasa Memorial Cathedral Media Team</strong></p>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Status update email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending status update email:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email with login credentials
const sendWelcomeEmail = async (user, temporaryPassword) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"ACK Mombasa Media Team" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Welcome to ACK Media Team - Your Account is Ready!',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .credentials-box {
              background: #fff;
              border: 2px solid #4caf50;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #4caf50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to the Team!</h1>
          </div>

          <div class="content">
            <h2>Dear ${user.fullName},</h2>

            <p>Congratulations! Your application has been approved and your account is now active.</p>

            <div class="credentials-box">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email/Username:</strong> ${user.email}</p>
              <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
            </div>

            <div class="warning">
              <p><strong>⚠️ Important Security Notice:</strong></p>
              <p>Please change your password immediately after logging in for the first time. This temporary password should not be shared with anyone.</p>
            </div>

            <p><a href="${process.env.FRONTEND_URL}/login" class="button">Login Now</a></p>

            <h3>What you can do in your account:</h3>
            <ul>
              <li>View your assigned roles and responsibilities</li>
              <li>Check the calendar for upcoming events and meetings</li>
              <li>Access meeting minutes and documents</li>
              <li>Receive notifications about team activities</li>
              <li>Update your profile information</li>
            </ul>

            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>

            <p>We're excited to have you on the team!</p>

            <p><strong>ACK Mombasa Memorial Cathedral Media Team</strong></p>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

// Send role assignment notification email
const sendRoleAssignmentEmail = async (user, role) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"ACK Mombasa Media Team" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `New Role Assigned: ${role.name}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .role-box {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 20px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 New Role Assigned</h1>
          </div>

          <div class="content">
            <h2>Dear ${user.fullName},</h2>

            <p>You have been assigned a new role in the Media Team:</p>

            <div class="role-box">
              <h3>${role.name}</h3>
              <p>${role.description}</p>

              ${role.responsibilities && role.responsibilities.length > 0 ? `
                <h4>Your Responsibilities:</h4>
                <ul>
                  ${role.responsibilities.map(r => `<li>${r}</li>`).join('')}
                </ul>
              ` : ''}
            </div>

            <p>Log in to your account to view complete role details and get started!</p>

            <p><a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 30px; background: #2196f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Dashboard</a></p>

            <p><strong>ACK Mombasa Memorial Cathedral Media Team</strong></p>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Role assignment email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending role assignment email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"ACK Mombasa Media Team" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #ff5722;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>

          <div class="content">
            <h2>Dear ${user.fullName},</h2>

            <p>We received a request to reset your password for your ACK Media Team account.</p>

            <p>Click the button below to reset your password:</p>

            <p><a href="${resetUrl}" class="button">Reset Password</a></p>

            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>

            <p>If you have any concerns, please contact the church office immediately.</p>

            <p><strong>ACK Mombasa Memorial Cathedral Media Team</strong></p>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendConfirmationEmail,
    sendAdminNotification,
    sendStatusUpdateEmail,
    sendWelcomeEmail,
    sendRoleAssignmentEmail,
    sendPasswordResetEmail
};
