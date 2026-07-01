import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AgentType = "personal" | "company";

export interface IAgent extends Document {
    user: Types.ObjectId;

    type: AgentType;

    postalCode?: string;
    fixedNumber?: string;

    pricePerLanding: number;

    companyName?: string;
    ceoName?: string;
    economicNumber?: string;
    registrationNumber?: string;

    limits: {
        files: number;
        blocks: number;
        pages: number;
    };

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["personal", "company"],
            required: true,
            index: true,
        },

        postalCode: {
            type: String,
            trim: true,
        },

        fixedNumber: {
            type: String,
            trim: true,
            maxlength: 11,
            match: [/^$|^\d{11}$/, "شماره تماس باید دقیقاً ۱۱ رقم باشد."],
        },

        pricePerLanding: {
            type: Number,
            default: 0,
            min: 0,
        },

        companyName: {
            type: String,
            trim: true,
            maxlength: 150,
            required: function (this: IAgent) {
                return this.type === "company";
            },
        },

        ceoName: {
            type: String,
            trim: true,
            maxlength: 120,
            required: function (this: IAgent) {
                return this.type === "company";
            },
        },

        economicNumber: {
            type: String,
            trim: true,
            required: function (this: IAgent) {
                return this.type === "company";
            },
        },
        
        registrationNumber: {
            type: String,
            trim: true,
            required: function (this: IAgent) {
                return this.type === "company";
            },
        },

        limits: {
            files: {
                type: Number,
                default: 0,
                min: 0,
            },

            blocks: {
                type: Number,
                default: 0,
                min: 0,
            },

            pages: {
                type: Number,
                default: 0,
                min: 0,
            },

        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

AgentSchema.pre("validate", function (next) {
    if (this.type === "personal") {
        this.companyName = undefined;
        this.ceoName = undefined;
        this.economicNumber = undefined;
        this.registrationNumber = undefined;
    }

    next();
});

AgentSchema.set("toJSON", {
    transform: function (_doc, ret) {
        const obj = ret as unknown as Record<string, unknown>;
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        return obj;
    },
});

const Agent: Model<IAgent> =
    mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);

export default Agent;
