import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import {
    withDB,
    withAuth,
    withStatus,
    withRole,
} from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import User, {
    UserRole,
    UserStatus,
} from "@/models/users";
import "@/models/permission";

// GET /api/users
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
        100,
        Math.max(1, Number(searchParams.get("limit") ?? 20)),
    );

    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const mode = searchParams.get("mode");

    const query: Record<string, unknown> = {
        isDeleted: false,
    };

    if (role) query.role = role;
    if (status) query.status = status;

    if (mode === "agent-options") {
        query.status = "active";
        query.agentid = { $exists: false };
    }

    if (mode === "notification-options") {
        query.status = "active";
    }

    if (search) {
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        query.$or = [
            { phoneNumber: { $regex: safeSearch, $options: "i" } },
            { firstName: { $regex: safeSearch, $options: "i" } },
            { lastName: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
        ];
    }

    if (
        mode === "agent-options" ||
        mode === "notification-options"
    ) {
        const users = await User.find(query)
            .select("firstName lastName phoneNumber email role status")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            users,
            total: users.length,
            page: 1,
            limit,
        });
    }

    const [users, total] = await Promise.all([
        User.find(query)
            .populate("permissions", "name isActive")
             .populate(
                "createdBy",
                "firstName lastName phoneNumber role",
            )
            .populate(
                "updatedBy",
                "firstName lastName phoneNumber role",
            )
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),

        User.countDocuments(query),
    ]);

    return NextResponse.json({
        users,
        total,
        page,
        limit,
    });
});

// POST /api/users
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
)(async (req: AuthRequest) => {
    try {
        const currentUser = req.ctx?.user;

        if (!currentUser) {
            return NextResponse.json(
                {
                    code: "UNAUTHORIZED",
                    message: "Authentication is required.",
                },
                { status: 401 },
            );
        }

        const body = await req.json();

        const phoneNumber =
            typeof body.phoneNumber === "string"
                ? body.phoneNumber.trim()
                : "";
        const firstName =
            typeof body.firstName === "string"
                ? body.firstName.trim()
                : "";

        const lastName =
            typeof body.lastName === "string"
                ? body.lastName.trim()
                : "";

        if (!firstName || !lastName) {
            return NextResponse.json(
                {
                    code: "NAME_REQUIRED",
                    message: "نام و نام خانوادگی الزامی است.",
                },
                { status: 400 },
            );
        }
        if (!phoneNumber) {
            return NextResponse.json(
                {
                    code: "PHONE_NUMBER_REQUIRED",
                    message: "شماره تماس الزامی است.",
                },
                { status: 400 },
            );
        }

        const allowedRoles: UserRole[] = [
            "user",
            "agent",
            "admin",
            "superAdmin",
        ];

        const allowedStatuses: UserStatus[] = [
            "active",
            "inactive",
            "blocked",
            "pending",
        ];

        const role: UserRole = allowedRoles.includes(body.role)
            ? body.role
            : "user";

        const status: UserStatus = allowedStatuses.includes(
            body.status,
        )
            ? body.status
            : "active";

        // Only a superAdmin should create another superAdmin.
        if (
            role === "superAdmin" &&
            currentUser.role !== "superAdmin"
        ) {
            return NextResponse.json(
                {
                    code: "SUPER_ADMIN_CREATION_FORBIDDEN",
                    message:
                        "Only a super admin can create another super admin.",
                },
                { status: 403 },
            );
        }

        const existingUser = await User.findOne({
            phoneNumber,
            isDeleted: false,
        }).lean();

        if (existingUser) {
            return NextResponse.json(
                {
                    code: "PHONE_NUMBER_ALREADY_EXISTS",
                    message:
                        "A user with this phone number already exists.",
                },
                { status: 409 },
            );
        }

        const user = await User.create({
            firstName,
            lastName,

            phoneNumber,

            email:
                typeof body.email === "string" &&
                    body.email.trim()
                    ? body.email.trim().toLowerCase()
                    : undefined,

            avatarUrl:
                typeof body.avatarUrl === "string"
                    ? body.avatarUrl.trim()
                    : undefined,

            nationalCode:
                typeof body.nationalCode === "string" &&
                    body.nationalCode.trim()
                    ? body.nationalCode.trim()
                    : undefined,

            fatherName:
                typeof body.fatherName === "string"
                    ? body.fatherName.trim()
                    : undefined,

            role,
            status,

            agentid: body.agentid || undefined,

            permissions: Array.isArray(body.permissions)
                ? body.permissions
                : [],

            limits: {
                files: Math.max(
                    0,
                    Number(body.limits?.files ?? 0),
                ),
                blocks: Math.max(
                    0,
                    Number(body.limits?.blocks ?? 0),
                ),
                pages: Math.max(
                    0,
                    Number(body.limits?.pages ?? 0),
                ),
                landingPages: Math.max(
                    0,
                    Number(body.limits?.landingPages ?? 0),
                ),
            },

            isPhoneVerified: Boolean(body.isPhoneVerified),
            phoneVerifiedAt: body.isPhoneVerified
                ? new Date()
                : undefined,

            isDeleted: false,

            // These values must come from the authenticated server user,
            // not from the frontend payload.
            createdBy: currentUser._id,
            updatedBy: currentUser._id,
        });

        const populatedUser = await User.findById(user._id)
            .populate("permissions", "name isActive")
            .populate(
                "createdBy",
                "firstName lastName phoneNumber role",
            )
            .populate(
                "updatedBy",
                "firstName lastName phoneNumber role",
            )
            .lean();

        return NextResponse.json(
            {
                message: "User created successfully.",
                user: populatedUser,
            },
            { status: 201 },
        );
    } catch (error: unknown) {
        console.error("POST /api/users error:", error);

        const mongoError = error as {
            code?: number;
            keyPattern?: Record<string, number>;
        };

        if (mongoError.code === 11000) {
            return NextResponse.json(
                {
                    code: "DUPLICATE_USER_DATA",
                    message:
                        "The phone number, email, or national code already exists.",
                    field: mongoError.keyPattern
                        ? Object.keys(mongoError.keyPattern)[0]
                        : undefined,
                },
                { status: 409 },
            );
        }

        return NextResponse.json(
            {
                code: "USER_CREATION_FAILED",
                message: "Failed to create user.",
            },
            { status: 500 },
        );
    }
});