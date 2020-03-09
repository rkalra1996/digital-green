import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: false},
    userId: {type: String, required: false},
    email: {type: String, required: false},
    phoneNumber: {type: String, required: false},
    role: {type: String, required: false},
    dob: {type: Date, required: false},
});
