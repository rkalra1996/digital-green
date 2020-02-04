import * as mongoose from 'mongoose';

export const SessionSchema = new mongoose.Schema({
    name: String,
    created: Date,
    session_id: String,
    username: String,
    isUploaded: Boolean,
    recordings: Array,
});
