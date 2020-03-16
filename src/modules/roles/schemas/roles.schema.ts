import * as mongoose from 'mongoose';

export const RolesSchema = new mongoose.Schema({
    role: { type: String, required: false },
    questions: {type: Array, required: false},
    topics: {type: Object, required: false},
});
