import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "closed"],
        default: "open",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:   true,
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    
    attachments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
        }
    ],
    replies: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            message: {
                type: String,
                required: true,
                trim: true,
            },
            isStaff: {
                type: Boolean,
                default: false,
            },
            attachments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "File",
                },
            ],
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    lastReplyAt: {
        type: Date,
    },
}, { timestamps: true });

const Ticket: mongoose.Model<any> =
    mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;
