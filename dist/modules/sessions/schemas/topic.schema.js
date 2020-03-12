"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.TopicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    created: { type: Date, required: true },
    session_id: { type: String, required: true },
    username: { type: String, required: true },
    topics_limit: { type: Number, required: true },
    isUploaded: { type: Boolean, required: true },
    topics: {
        type: Array,
        required: true,
        default: [],
    },
});
//# sourceMappingURL=topic.schema.js.map