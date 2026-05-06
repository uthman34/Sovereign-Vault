import nodemailer from "nodemailer";

let transporter = null;

// Initialize email transporter
export const initializeEmailService = () => {
    const emailProvider = process.env.EMAIL_PROVIDER || "mailtrap";

    if (emailProvider === "gmail") {
        const gmailUser = process.env.GMAIL_USER || "";
        const gmailPassword = process.env.GMAIL_APP_PASSWORD || "";

        if (
            gmailUser.includes("replace_me") ||
            gmailPassword.includes("replace_me") ||
            !gmailUser.trim() ||
            !gmailPassword.trim()
        ) {
            console.warn("Email service skipped: Gmail credentials are not configured.");
            return;
        }
    }

    if (emailProvider === "mailtrap") {
        transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });
    } else if (emailProvider === "gmail") {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } else if (emailProvider === "sendgrid") {
        transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY,
            },
        });
    }

    if (transporter) {
        console.log(`✓ Email service initialized with ${emailProvider}`);
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
    if (!transporter) {
        console.warn("Email service not initialized");
        return false;
    }

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/auth?mode=resetToken&email=${email}&token=${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@sovereignvault.com",
        to: email,
        subject: "Sovereign Vault - Password Reset Request",
        html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${userName || "User"},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>Or copy this code and enter it on the reset page:</p>
      <p style="font-family: monospace; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
        ${resetToken}
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">Sovereign Vault Security Team</p>
    `,
        text: `
Password Reset Request

Hi ${userName || "User"},

We received a request to reset your password. Visit this link to reset it:
${resetLink}

Or enter this code on the reset page:
${resetToken}

This link will expire in 1 hour.

If you didn't request a password reset, you can ignore this email.

Sovereign Vault Security Team
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✓ Password reset email sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`✗ Error sending email to ${email}:`, error.message);
        return false;
    }
};

// Verify email service connection
export const verifyEmailService = async () => {
    if (!transporter) {
        console.warn("Email service not initialized");
        return false;
    }

    try {
        await transporter.verify();
        console.log("✓ Email service connection verified");
        return true;
    } catch (error) {
        console.error("✗ Email service verification failed:", error.message);
        return false;
    }
};
