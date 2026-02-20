const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    registrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration'
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }

}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Index for searching
userSchema.index({ fullName: 'text', email: 'text', username: 'text' });

module.exports = mongoose.model('User', userSchema);
