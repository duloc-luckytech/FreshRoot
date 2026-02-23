import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAddress {
    label: string;
    detail: string;
    coordinates?: [number, number];
}

export interface IEmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    rank: 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Challenger';
    points: number;
    avatar: string;
    addresses: IAddress[];
    emergencyContacts: IEmergencyContact[];
    isActive: boolean;
    bio?: string;
    biometricEnabled: boolean;
    role: 'user' | 'agent';
    createdAt: Date;
    getSignedJwtToken(): string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const AddressSchema = new Schema({
    label: { type: String, required: true },
    detail: { type: String, required: true },
    coordinates: { type: [Number], index: '2dsphere' },
});

const EmergencyContactSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
});

const UserSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    rank: {
        type: String,
        enum: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
        default: 'Iron',
    },
    points: {
        type: Number,
        default: 0,
    },
    avatar: {
        type: String,
        default: 'https://i.pravatar.cc/150',
    },
    addresses: [AddressSchema],
    emergencyContacts: [EmergencyContactSchema],
    isActive: {
        type: Boolean,
        default: true,
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot be more than 200 characters'],
    },
    biometricEnabled: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'agent'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    if (this.password) {
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (this: IUser) {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password || '');
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
