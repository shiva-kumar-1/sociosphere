import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_USER =", process.env.SMTP_USER);

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true, // port 465 requires secure:true — Render blocks 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

/* ✅ VERIFY SMTP CONNECTION ON STARTUP */
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Failed:", error.message);
    } else {
        console.log("✅ SMTP Server Ready to send emails");
    }
});

export const sendOTPEmail = async (to, otp) => {
    try {
        await transporter.sendMail({
            from: `"SocioSphere" <${process.env.OTP_EMAIL}>`,
            to,
            subject: "Your OTP Code",
            html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `
        });
    } catch (err) {
        console.error("❌ OTP Email Error FULL:", err);
        throw new Error("Failed to send OTP email");
    }
};
export const sendResetPasswordEmail = async (email, resetLink) => {
    await transporter.sendMail({
        from: `"SocioSphere" <aravindmora343@gmail.com>`,
        to: email,
        subject: "Reset Your Password",
        html: `
      <h3>Password Reset Request</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 15 minutes.</p>
    `,
    });
};
/* ==========================================
   SIGNUP THANK YOU EMAIL
========================================== */

export const sendSignupEmail = async (email, fullName) => {
    try {
        const info = await transporter.sendMail({
            from: `"SocioSphere" <aravindmora343@gmail.com>`,
            to: email,
            subject: "🎉 Welcome to SocioSphere!",
            html: `
            <h2>Hello ${fullName},</h2>
            <p>Thank you for joining <b>SocioSphere</b>!</p>
            <p>We're excited to have you on board.</p>
            <br/>
            <p>You can now explore services, connect with providers, and grow your network.</p>
            <br/>
            <p>Best Regards,<br/>SocioSphere Team 🚀</p>
        `
        });
        console.log("📧 Signup email sent:", info.response);

    } catch (err) {
        console.error("❌ Signup Email Error FULL:", err);
    }
};

/* ==========================================
   LOGIN WELCOME BACK EMAIL
========================================== */

export const sendLoginEmail = async (email, fullName) => {
    try {
        const info = await transporter.sendMail({
            from: `"SocioSphere" <aravindmora343@gmail.com>`,
            to: email,
            subject: "👋 Welcome Back to SocioSphere",
            html: `
            <h2>Hi ${fullName},</h2>
            <p>You have successfully logged into your SocioSphere account.</p>
            <p>If this wasn't you, please reset your password immediately.</p>
            <br/>
            <p>Have a productive day! 🚀</p>
            <br/>
            <p>SocioSphere Team</p>
        `
        });
        console.log("📧 Login email sent:", info.response);
    } catch (err) {
        console.error("❌ Login Email Error FULL:", err);
    }
};
/* ==========================================
   PROVIDER UPGRADE EMAIL
========================================== */

export const sendUpgradeEmail = async (email, fullName) => {
    try {
        const info = await transporter.sendMail({
            from: `"SocioSphere" <aravindmora343@gmail.com>`,
            to: email,
            subject: "🚀 You're Now a Service Provider!",
            html: `
            <h2>Congratulations ${fullName}! 🎉</h2>
            <p>Your account has been upgraded to <b>Service Provider</b> on SocioSphere.</p>
            <br/>
            <p>🔎 What happens next?</p>
            <ul>
                <li>Your profile will be reviewed by our admin team.</li>
                <li>Once verified, you can start creating services.</li>
                <li>Customers will be able to book your services.</li>
            </ul>
            <br/>
            <p>We’re excited to have you as a provider! 🚀</p>
            <br/>
            <p>Best Regards,<br/>SocioSphere Team</p>
        `
        });
        console.log("📧 Upgrade email sent:", info.response);
    } catch (err) {
        console.error("❌ Upgrade Email Error FULL:", err);
    }
};
/* ==========================================
   PROVIDER VERIFIED EMAIL
========================================== */

export const sendProviderVerifiedEmail = async (email, fullName) => {
    try {
        const info = await transporter.sendMail({
            from: `"SocioSphere" <aravindmora343@gmail.com>`,
            to: email,
            subject: "✅ Your Provider Account Has Been Verified!",
            html: `
            <h2>Congratulations ${fullName}! 🎉</h2>
            <p>Your Service Provider account has been <b>successfully verified</b> by our admin team.</p>
            <br/>
            <p>You can now:</p>
            <ul>
                <li>✅ Create and manage services</li>
                <li>✅ Receive booking requests</li>
                <li>✅ Start earning through SocioSphere</li>
            </ul>
            <br/>
            <p>Login now and start offering your services!</p>
            <br/>
            <p>Best Regards,<br/>SocioSphere Team 🚀</p>
        `
        });
        console.log("📧 Verified email sent:", info.response);
    } catch (err) {
        console.error("❌ Verified Email Error FULL:", err);
    }
};
/* ==========================================
   PAYMENT SUCCESS EMAIL
========================================== */

export const sendPaymentSuccessEmail = async (email, fullName, amount) => {
    try {
        const info = await transporter.sendMail({
            from: `"SocioSphere" <aravindmora343@gmail.com>`,
            to: email,
            subject: "💳 Payment Successful - SocioSphere",
            html: `
                <h2>Hello ${fullName},</h2>
                <p>Your payment of <b>₹${amount}</b> has been successfully completed.</p>
                <br/>
                <p>Thank you for using SocioSphere services.</p>
                <br/>
                <p>Best Regards,<br/>SocioSphere Team 🚀</p>
            `
        });

        console.log("📧 Payment email sent:", info.response);

    } catch (err) {
        console.error("❌ Payment Email Error FULL:", err);
    }
};