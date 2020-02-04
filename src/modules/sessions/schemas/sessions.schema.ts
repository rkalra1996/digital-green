import * as mongoose from 'mongoose';

export const SessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    created: { type: Date, required: true },
    session_id: { type: String, required: true },
    username: { type: String, required: true },
    isUploaded: { type: Boolean, required: true },
    topics: {
        type: Array,
        required: true,
        default: [],
    },
});
