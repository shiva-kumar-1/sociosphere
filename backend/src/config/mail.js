import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

// Use Brevo HTTP API via nodemailer (port 443 - never blocked by Render)
export const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Failed:", error.message);
    } else {
        console.log("✅ SMTP Server Ready to send emails");
    }
});

const FROM = \`"SocioSphere" <\${process.env.SMTP_USER}>\`;

export const sendOTPEmail = async (to, otp) => {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: "Your OTP Code - SocioSphere",
        html: \`<h2>OTP Verification</h2><p>Your OTP is:</p><h1>\${otp}</h1><p>Valid for 5 minutes</p>\`
    });
};

export const sendResetPasswordEmail = async (email, resetLink) => {
    await transporter.sendMail({
        from: FROM,
        to: email,
        subject: "Reset Your Password - SocioSphere",
        html: \`<h3>Password Reset Request</h3><p>Click the link below to reset your password:</p><a href="\${resetLink}">\${resetLink}</a><p>This link expires in 15 minutes.</p>\`
    });
};

export const sendSignupEmail = async (email, fullName) => {
    try {
        await transporter.sendMail({
            from: FROM, to: email,
            subject: "🎉 Welcome to SocioSphere!",
            html: \`<h2>Hello \${fullName},</h2><p>Thank you for joining <b>SocioSphere</b>! We're excited to have you on board.</p><p>Best Regards,<br/>SocioSphere Team 🚀</p>\`
        });
    } catch (err) { console.error("❌ Signup Email Error:", err.message); }
};

export const sendLoginEmail = async (email, fullName) => {
    try {
        await transporter.sendMail({
            from: FROM, to: email,
            subject: "👋 Welcome Back to SocioSphere",
            html: \`<h2>Hi \${fullName},</h2><p>You have successfully logged in. If this wasn't you, please reset your password immediately.</p><p>SocioSphere Team</p>\`
        });
    } catch (err) { console.error("❌ Login Email Error:", err.message); }
};

export const sendUpgradeEmail = async (email, fullName) => {
    try {
        await transporter.sendMail({
            from: FROM, to: email,
            subject: "🚀 You're Now a Service Provider!",
            html: \`<h2>Congratulations \${fullName}! 🎉</h2><p>Your account has been upgraded to <b>Service Provider</b>.</p><p>SocioSphere Team</p>\`
        });
    } catch (err) { console.error("❌ Upgrade Email Error:", err.message); }
};

export const sendProviderVerifiedEmail = async (email, fullName) => {
    try {
        await transporter.sendMail({
            from: FROM, to: email,
            subject: "✅ Your Provider Account Has Been Verified!",
            html: \`<h2>Congratulations \${fullName}! 🎉</h2><p>Your Service Provider account has been <b>successfully verified</b>.</p><p>SocioSphere Team 🚀</p>\`
        });
    } catch (err) { console.error("❌ Verified Email Error:", err.message); }
};

export const sendPaymentSuccessEmail = async (email, fullName, amount) => {
    try {
        await transporter.sendMail({
            from: FROM, to: email,
            subject: "💳 Payment Successful - SocioSphere",
            html: \`<h2>Hello \${fullName},</h2><p>Your payment of <b>₹\${amount}</b> has been successfully completed.</p><p>SocioSphere Team 🚀</p>\`
        });
    } catch (err) { console.error("❌ Payment Email Error:", err.message); }
};