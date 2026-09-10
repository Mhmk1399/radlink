import { NextResponse } from "next/server";
import mongoose from "mongoose";
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
import Agent from "@/models/agent";
import "@/models/permission";
import {
    isValidEmail,
    isValidNationalCode,
    isValidPhoneNumber,
    normalizeEmail,
    normalizeNationalCode,
    normalizePhoneNumber,
    toEnglishDigits,
} from "@/lib/validation/identityFields";
import { getManagedUserIds, hasAgentScopedRole } from "@/lib/auth/agentScope";
import { applyDateRangeFilters } from "@/lib/api/dateRangeFilters";
import {
    hashPassword,
    validateStrongPassword,
} from "@/lib/auth/password";
import {
    normalizeIdList,
    validateSinglePermissionIdSelection,
} from "@/lib/auth/permissionAssignment";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";

function normalizeLimits(value: unknown) {
    const limits =
        typeof value === "object" && value !== null
            ? (value as Record<string, unknown>)
            : {};

    return {
        files: Math.max(0, Number(limits.files) || 0),
        blocks: Math.max(0, Number(limits.blocks) || 0),
        pages: Math.max(0, Number(limits.pages) || 0),
    };
}

function resolveUserLimitView(user: Record<string, unknown>) {
    const ownLimits = normalizeLimits(user.limits);
    const agent =
        user.agentid && typeof user.agentid === "object"
            ? (user.agentid as Record<string, unknown>)
            : null;
    const inheritedLimits = agent ? normalizeLimits(agent.limits) : null;
    const hasAgent = Boolean(agent || user.agentid);
    const overrideEnabled = Boolean(user.limitsOverrideEnabled);
    const usesAgentLimits = Boolean(hasAgent && !overrideEnabled && inheritedLimits);
    const effectiveLimits = usesAgentLimits && inheritedLimits
        ? inheritedLimits
        : ownLimits;

    return {
        ...user,
        limits: effectiveLimits,
        ownLimits,
        inheritedLimits,
        limitsOverrideEnabled: hasAgent ? overrideEnabled : true,
        limitsSource: usesAgentLimits ? "agent" : "user",
    };
}

// GET /api/users
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("user", "agent", "agentManager", "admin", "superAdmin"),
)(async (req: AuthRequest) => {
    const requester = req.ctx.user!;
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
    const firstNameFilter =
        searchParams.get("filter_firstName") ??
        searchParams.get("firstName");
    const lastNameFilter =
        searchParams.get("filter_lastName") ??
        searchParams.get("lastName");



    const phoneNumberFilter =
        searchParams.get("filter_phoneNumber") ??
        searchParams.get("phoneNumber");
    const createdByIdFilter = (
        searchParams.get("filter_createdById") ??
        searchParams.get("createdById") ??
        searchParams.get("filter_createdBy") ??
        searchParams.get("createdBy") ??
        searchParams.get("filter_creatorId") ??
        searchParams.get("creatorId") ??
        ""
    ).trim();
    const includeDeleted =
        searchParams.get("includeDeleted") === "true" && !mode;

    const query: Record<string, unknown> = includeDeleted
        ? {}
        : { isDeleted: false };

    const isAgentOptionsMode = mode === "agent-options";

    if (requester.role === "user") {
        query._id = requester._id;
    } else if (hasAgentScopedRole(requester.role) && !isAgentOptionsMode) {
        const managedUserIds = await getManagedUserIds(requester, {
            includeSelf: false,
        });
        query._id = { $in: managedUserIds ?? [] };
    }

    if (role) query.role = role;
    if (status) query.status = status;
    const escapeRegex = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (firstNameFilter) {
        query.firstName = {
            $regex: escapeRegex(firstNameFilter.trim()),
            $options: "i",
        };
    }

    if (lastNameFilter) {
        query.lastName = {
            $regex: escapeRegex(lastNameFilter.trim()),
            $options: "i",
        };
    }

    if (phoneNumberFilter) {
        query.phoneNumber = {
            $regex: escapeRegex(toEnglishDigits(phoneNumberFilter.trim())),
            $options: "i",
        };
    }
    if (
        createdByIdFilter &&
        mongoose.Types.ObjectId.isValid(createdByIdFilter)
    ) {
        query.createdBy = createdByIdFilter;
    }

    if (mode === "agent-options") {
        query.status = "active";
        query.role = { $in: ["agentManager", "agent"] };
        query.agentid = { $exists: false };
    }

    if (mode === "notification-options") {
        query.status = "active";
    }

    if (search) {
        const safeSearch = escapeRegex(toEnglishDigits(search.trim()));

        query.$or = [
            { phoneNumber: { $regex: safeSearch, $options: "i" } },
            { firstName: { $regex: safeSearch, $options: "i" } },
            { lastName: { $regex: safeSearch, $options: "i" } },
            { collectionName: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
        ];
    }

    applyDateRangeFilters(query, searchParams, [
        "lastLoginAt",
        "lastOtpRequestAt",
        "phoneVerifiedAt",
        "createdAt",
        "updatedAt",
    ]);

    if (
        mode === "agent-options" ||
        mode === "notification-options"
    ) {
        const users = await User.find(query)
            .select(
                "firstName lastName phoneNumber email nationalCode fatherName avatarUrl role status createdAt",
            )
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
            .populate({
                path: "agentid",
                select: "user type companyName limits",
                populate: {
                    path: "user",
                    select: "firstName lastName phoneNumber email",
                },
            })
            .populate(
                "createdBy",
                "firstName lastName phoneNumber role",
            )
            .populate(
                "updatedBy",
                "firstName lastName phoneNumber role",
            )
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),

        User.countDocuments(query),
    ]);

    return NextResponse.json({
        users: users.map((user) =>
            resolveUserLimitView(user as Record<string, unknown>),
        ),
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
    withRole("agent", "agentManager", "admin", "superAdmin"),
)(async (req: AuthRequest) => {
    try {
        const currentUser = req.ctx?.user;
        if (!currentUser) {
            return NextResponse.json(
                {
                    code: "UNAUTHORIZED",
                    message: "برای انجام این عملیات ابتدا وارد حساب کاربری شوید.",
                },
                { status: 401 },
            );
        }

        const body = await req.json();
        const resolvedRequesterAccess =
            currentUser.role === "superAdmin"
                ? null
                : await resolveUserAccess(String(currentUser._id), currentUser.permissions);
        const hasUsersCreateAccess =
            currentUser.role === "superAdmin" ||
            currentUser.role === "admin" ||
            (resolvedRequesterAccess?.components["admin.users"]?.has("create") ??
                false);

        const rawPhoneNumber = toEnglishDigits(body.phoneNumber).trim();
        const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
        const email =
            typeof body.email === "string" ? normalizeEmail(body.email) : "";
        const nationalCode =
            typeof body.nationalCode === "string"
                ? normalizeNationalCode(toEnglishDigits(body.nationalCode).trim())
                : "";
        const firstName =
            typeof body.firstName === "string"
                ? body.firstName.trim()
                : "";

        const lastName =
            typeof body.lastName === "string"
                ? body.lastName.trim()
                : "";
        const collectionName =
            typeof body.collectionName === "string"
                ? body.collectionName.trim()
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
        if (!isValidPhoneNumber(rawPhoneNumber) || phoneNumber !== rawPhoneNumber) {
            return NextResponse.json(
                { code: "INVALID_PHONE_NUMBER", message: "شماره تماس باید دقیقاً ۱۱ رقم باشد." },
                { status: 400 },
            );
        }
        if (email && !isValidEmail(email)) {
            return NextResponse.json(
                { code: "INVALID_EMAIL", message: "فرمت ایمیل معتبر نیست." },
                { status: 400 },
            );
        }
        if (nationalCode && !isValidNationalCode(nationalCode)) {
            return NextResponse.json(
                { code: "INVALID_NATIONAL_CODE", message: "کد ملی باید دقیقاً ۱۰ رقم باشد." },
                { status: 400 },
            );
        }
        if (nationalCode && (await User.exists({ nationalCode }))) {
            return NextResponse.json(
                {
                    code: "NATIONAL_CODE_ALREADY_EXISTS",
                    message: "این کد ملی قبلاً ثبت شده است.",
                    field: "nationalCode",
                },
                { status: 409 },
            );
        }

        const hasScopedRequesterRole = hasAgentScopedRole(currentUser.role);
        const requesterAgent =
            hasScopedRequesterRole
                ? await Agent.findOne({
                    user: currentUser._id,
                    isActive: true,
                }).select("_id limits").lean()
                : null;
        if (hasScopedRequesterRole && !requesterAgent) {
            return NextResponse.json(
                { message: "پروفایل نمایندگی فعال برای شما پیدا نشد." },
                { status: 403 },
            );
        }

        const agentId = requesterAgent
            ? typeof body.agentid === "string" && body.agentid.trim()
                ? body.agentid.trim()
                : String(requesterAgent._id)
            : typeof body.agentid === "string"
                ? body.agentid.trim()
                : "";
        let selectedAgentForUser:
            | { limits?: { files?: number; blocks?: number; pages?: number } }
            | null = null;

        if (agentId) {
            if (!mongoose.Types.ObjectId.isValid(agentId)) {
                return NextResponse.json(
                    { message: "شناسه نماینده معتبر نیست." },
                    { status: 400 },
                );
            }

            selectedAgentForUser = await Agent.findOne({
                _id: agentId,
                isActive: true,
            }).select("limits").lean();
            if (!selectedAgentForUser) {
                return NextResponse.json(
                    { message: "نماینده انتخاب‌شده پیدا نشد." },
                    { status: 404 },
                );
            }
        }

        const allowedRoles: UserRole[] = [
            "user",
            "agent",
            "agentManager",
            "admin",
            "superAdmin",
        ];

        const allowedStatuses: UserStatus[] = [
            "active",
            "inactive",
        ];

        const canUseFullCreatePayload = hasUsersCreateAccess;

        const role: UserRole = canUseFullCreatePayload && allowedRoles.includes(body.role)
                ? body.role
                : "user";

        const status: UserStatus = canUseFullCreatePayload && allowedStatuses.includes(
                body.status,
            )
                ? body.status
                : "active";
        const requestedLimitsOverrideEnabled =
            typeof body.limitsOverrideEnabled === "boolean"
                ? body.limitsOverrideEnabled
                : false;
        const limitsOverrideEnabled =
            canUseFullCreatePayload && agentId
                ? requestedLimitsOverrideEnabled
                : !agentId;
        const effectiveLimits = requesterAgent
            ? requesterAgent.limits
            : agentId && !limitsOverrideEnabled
                ? selectedAgentForUser?.limits
            : body.limits;
        const requestedPassword =
            typeof body.password === "string" ? body.password : "";
        const hasRequestedPassword = requestedPassword.trim().length > 0;
        const permissionIds =
            canUseFullCreatePayload && Array.isArray(body.permissions)
                ? normalizeIdList(body.permissions)
                : [];
        if (!permissionIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
            return NextResponse.json(
                { message: "یکی از شناسه‌های دسترسی معتبر نیست." },
                { status: 400 },
            );
        }

        const permissionSelectionError =
            validateSinglePermissionIdSelection(permissionIds);
        if (permissionSelectionError) {
            return NextResponse.json(
                { code: "TOO_MANY_USER_PERMISSIONS", message: permissionSelectionError },
                { status: 409 },
            );
        }

        if (
            hasRequestedPassword &&
            !canUseFullCreatePayload
        ) {
            return NextResponse.json(
                { message: "فقط مدیر می‌تواند برای کاربر رمز عبور تعیین کند." },
                { status: 403 },
            );
        }

        const passwordValidationError = hasRequestedPassword
            ? validateStrongPassword(requestedPassword, { phoneNumber })
            : null;
        if (passwordValidationError) {
            return NextResponse.json(
                {
                    code: "INVALID_PASSWORD",
                    message: passwordValidationError,
                    field: "password",
                },
                { status: 400 },
            );
        }

        // فقط سوپر ادمین می‌تواند سوپر ادمین دیگری ایجاد کند.
        if (
            role === "superAdmin" &&
            currentUser.role !== "superAdmin"
        ) {
            return NextResponse.json(
                {
                    code: "SUPER_ADMIN_CREATION_FORBIDDEN",
                    message:
                        "فقط سوپر ادمین می‌تواند سوپر ادمین دیگری ایجاد کند.",
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
                        "کاربری با این شماره تماس قبلاً ثبت شده است.",
                },
                { status: 409 },
            );
        }

        const user = await User.create({
            firstName,
            lastName,
            collectionName: collectionName || undefined,

            phoneNumber,

            email: email || undefined,

            avatarUrl:
                typeof body.avatarUrl === "string"
                    ? body.avatarUrl.trim()
                    : undefined,

            nationalCode: nationalCode || undefined,

            fatherName:
                typeof body.fatherName === "string"
                    ? body.fatherName.trim()
                    : undefined,

            role,
            status,

            agentid: agentId || undefined,

            permissions: permissionIds,

            limits: normalizeLimits(effectiveLimits),
            limitsOverrideEnabled,

            isPhoneVerified: Boolean(body.isPhoneVerified),
            phoneVerifiedAt: body.isPhoneVerified
                ? new Date()
                : undefined,

            isDeleted: false,
            ...(hasRequestedPassword
                ? {
                    passwordHash: await hashPassword(requestedPassword),
                    passwordChangedAt: new Date(),
                }
                : {}),

            // These values must come from the authenticated server user,
            // not from the frontend payload.
            createdBy: currentUser._id,
            updatedBy: currentUser._id,
        });

        const populatedUser = await User.findById(user._id)
            .populate("permissions", "name isActive")
            .populate({
                path: "agentid",
                select: "user type companyName limits",
                populate: {
                    path: "user",
                    select: "firstName lastName phoneNumber email",
                },
            })
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
                message: "کاربر با موفقیت ساخته شد.",
                user: populatedUser
                    ? resolveUserLimitView(populatedUser as Record<string, unknown>)
                    : populatedUser,
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
                        "شماره تماس، ایمیل یا کد ملی قبلاً ثبت شده است.",
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
                message: "ساخت کاربر با خطا مواجه شد.",
            },
            { status: 500 },
        );
    }
});
