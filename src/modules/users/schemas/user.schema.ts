import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    username: String,
    password: {type: String, required: true},
    userId: String,
    email: {type: String},
    phoneNumber: String,
    role: {
        type: String,
        required: true,
    },
    dob: Date,
});
