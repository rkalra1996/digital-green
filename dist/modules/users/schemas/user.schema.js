"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.UserSchema = new mongoose.Schema({
    username: String,
    password: { type: String, required: true },
    userId: String,
    email: { type: String },
    phoneNumber: String,
    role: {
        type: String,
        required: true,
    },
    dob: Date,
});
//# sourceMappingURL=user.schema.js.map