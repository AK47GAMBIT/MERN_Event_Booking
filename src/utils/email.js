const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">Booking Confirmed!</h2>
                    <p>Hi <strong>${userName}</strong>!</p>
                    <p>Your booking for the event <strong>${eventTitle}</strong> has been successfully confirmed.</p>
                    <p style="color: #555;">Thank you for choosing Eventora. We look forward to seeing you there!</p>
                    <div style="margin-top: 20px; padding: 10px; background: #f4f4f4; border-radius: 8px;">
                        <p style="color: #999; font-size: 12px;">If you have any questions, please contact us.</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent to', userEmail);
    } catch (error) {
        console.error('Error sending booking email:', error);
    }
};

// ✅ New: cancellation email
const sendCancellationEmail = async (userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Cancelled: ${eventTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #e53e3e;">Booking Cancelled</h2>
                    <p>Hi <strong>${userName}</strong>!</p>
                    <p>Your booking for the event <strong>${eventTitle}</strong> has been cancelled.</p>
                    <p style="color: #555;">If this was a mistake, you can rebook anytime from the Eventora platform.</p>
                    <div style="margin-top: 20px; padding: 10px; background: #f4f4f4; border-radius: 8px;">
                        <p style="color: #999; font-size: 12px;">If you have any questions, please contact us.</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('Cancellation email sent to', userEmail);
    } catch (error) {
        console.error('Error sending cancellation email:', error);
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora Booking Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Eventora account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${userEmail} for ${type}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

module.exports = { sendBookingEmail, sendCancellationEmail, sendOTPEmail };