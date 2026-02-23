import { Response } from 'express';
import User from '../models/User';

// @desc    Get current user profile
// @route   GET /api/account/profile
// @access  Private
export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/account/profile
// @access  Private
export const updateProfile = async (req: any, res: Response) => {
    try {
        const { name, phone, bio, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, bio, avatar },
            { new: true, runValidators: true }
        );

        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update security (Change password)
// @route   PUT /api/account/security/password
// @access  Private
export const updatePassword = async (req: any, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        if (!user || !(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add/Update Address
// @route   POST /api/account/addresses
// @access  Private
export const updateAddresses = async (req: any, res: Response) => {
    try {
        const { addresses } = req.body; // Array of IAddress
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { addresses },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Emergency Contacts
// @route   POST /api/account/emergency-contacts
// @access  Private
export const updateEmergencyContacts = async (req: any, res: Response) => {
    try {
        const { emergencyContacts } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { emergencyContacts },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Biometrics
// @route   PUT /api/account/security/biometrics
// @access  Private
export const toggleBiometrics = async (req: any, res: Response) => {
    try {
        const { enabled } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { biometricEnabled: enabled },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Deactivate Account
// @route   DELETE /api/account
// @access  Private
export const deactivateAccount = async (req: any, res: Response) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { isActive: false });
        res.json({ success: true, message: 'Account deactivated' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
