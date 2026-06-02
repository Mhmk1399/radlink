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
        landingPages: number;
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

            landingPages: {
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
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Agent: Model<IAgent> =
    mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);

export default Agent;