const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connection = require('../../app');

// Define the user schema
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// Manually pick fields instead of using lodash _.pick
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    // Return only _id and email (manual selection of fields)
    return {
        _id: userObject._id,
        email: userObject.email,
        name: userObject.name
    };
};

// Generate authentication token
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    user.tokens.push({ access, token });

    return user.save().then(() => {
        return token;
    });
};

// Remove token from user document
UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.updateOne({
        $pull: {
            tokens: { token }
        }
    });
};


// Find user by token
UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

// Find user by credentials (email and password)
UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject(new Error('Invalid email or password'));
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            });
        });
    });
};

// Check if account already exists
UserSchema.statics.accountExists = function (email) {
    var User = this;
    console.log('Checking if account exists for email:', email);    
    console.log("Connection: ", connection);

    return User.findOne({ email }).then((user) => {
        return user || false;
    });
};

// Hash password before saving
UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// Create and export the User model
var User = mongoose.model('User', UserSchema, "User");

module.exports = { User };
