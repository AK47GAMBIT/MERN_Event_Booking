const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OtpModel = require('../models/otp.models');
const { sendOTPEmail } = require('../utils/email');

const generateToken = (user) => {
    const payload = { id: user._id, role: user.role };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            name,
            email,
            password: hash,
            role: 'user',
            isVerified: false
        });
        const otpCode = generateOTP();
        await OtpModel.create({
            email,
            otp: otpCode,
            action: 'account_verification',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        await sendOTPEmail(email, otpCode, 'account_verification');

        res.status(201).json({
            message: 'User registered successfully. Please check your email for the OTP to verify your account.',
            email: user.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.isVerified && user.role !== 'admin') {
            const otpCode = generateOTP();
            await OtpModel.deleteMany({ email, action: 'account_verification' });
            await OtpModel.create({
                email,
                otp: otpCode,
                action: 'account_verification',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            });
            await sendOTPEmail(email, otpCode, 'account_verification');
            return res.status(400).json({
                message: 'Account not verified. Please check your email for the new OTP.'
            });
        }
        res.status(200).json({
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp: userOtp } = req.body;
    try {
        const record = await OtpModel.findOne({
            email,
            otp: userOtp,
            action: 'account_verification'
        });
        if (!record) {
            return res.status(400).json({ message: 'OTP not found or expired' });
        }
        if (record.otp !== userOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        await userModel.updateOne({ email }, { isVerified: true });
        const user = await userModel.findOne({ email });
        await OtpModel.deleteMany({ email, action: 'account_verification' });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};