import mongoose, { Document, Schema } from 'mongoose';

const pageSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    url: {
        type: String,
        required: true,
        unique: true,
    },
    jason: {
        type: Object,
        required: true,
    },
    selectedtemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bgimage: {
        type: String,
    },
    blocks:{
    type: [Object],
    required: true,
    },
    logo: {
        type: String,
    },
    favicon: {
        type: String,
    },
    pagedata: {
        type: Object,
    },
    extraServices: {
        type: Object,
    },
    subscription: {
        type: Object,
    },
    seo: {
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        keywords: {
            type: [String],
        },
    },
    settings: {
        type: Object,
    },
    stats: {
        views: {
            type: Number,
            default: 0,
        },
        visitors: {
            type: Number,
            default: 0,
        },
    },
}, { timestamps: true });

export default mongoose.model('Page', pageSchema);