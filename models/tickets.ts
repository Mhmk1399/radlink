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
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Page",
    },
    siteOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    source: {
        type: String,
        enum: ["admin", "landing"],
        default: "admin",
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

ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ updatedAt: -1 });
ticketSchema.index({ requester: 1, createdAt: -1 });
ticketSchema.index({ requester: 1, status: 1, createdAt: -1 });
ticketSchema.index({ requester: 1, updatedAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ assignee: 1, status: 1, updatedAt: -1 });
ticketSchema.index({ page: 1, requester: 1, updatedAt: -1 });
ticketSchema.index({ siteOwner: 1, status: 1, updatedAt: -1 });

type TicketDocument = mongoose.InferSchemaType<typeof ticketSchema>;

const Ticket: mongoose.Model<TicketDocument> =
    mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default Ticket;
