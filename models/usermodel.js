const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    photo: String,
    role:{
            type: String,
            enum:['user','guide','admin','leadguide']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(ele) {
                return ele === this.password;
            },
            message: 'Passwords are not the same',
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
});

// Instance method to compare passwords
userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter =function(JWTTimestamp) {
    if(this.passwordChangedAt){
        console.log(passwordChangedAt,JWTTimestamp)
    }
    return false;
}

userSchema.methods.createPasswordResetToken = async function(){
    const resToken = crypto.randomBytes(32).toString('hex') 
    console.log(resToken);
    this.passwordResetToken=crypto
                            .createHash('sha256')
                            .update(resToken)
                            .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resToken;
}

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;
