import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

import { sendResetPasswordEmail } from "../config/mail.js";

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                message: "If account exists, reset link sent"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink =
            `http://localhost:5173/#/reset-password/${resetToken}`;

        // ✅ SEND EMAIL INSTEAD OF CONSOLE
        await sendResetPasswordEmail(email, resetLink);

        res.json({ message: "Reset link sent to your email" });

    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ error: "Failed to process reset" });
    }
};



/* ==========================================
   RESET PASSWORD
========================================== */

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;


        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });
        console.log("TOKEN FROM FRONTEND:", token);
        console.log("TOKEN TYPE:", typeof token);
        console.log("TOKEN LENGTH:", token.length);
        console.log("DB TOKEN:", user?.resetPasswordToken);
        if (!user) {
            return res.status(400).json({
                error: "Invalid or expired token"
            });
        }

        // 🔐 HASH THE NEW PASSWORD
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });

    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Password reset failed" });
    }
};
