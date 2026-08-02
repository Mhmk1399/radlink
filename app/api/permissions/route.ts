import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole, withPermission } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Permission from "@/models/permission";
import "@/models/access";
import User from "@/models/users";
import { accessCache } from "@/lib/auth/accessCache";
import { applyDateRangeFilters } from "@/lib/api/dateRangeFilters";
import {
    buildPermissionAssignmentConflictMessage,
    findExistingActivePermissionAssignments,
    normalizeIdList,
} from "@/lib/auth/permissionAssignment";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFilterParam(searchParams: URLSearchParams, key: string) {
    return (
        searchParams.get(`filter_${key}`)?.trim() ||
        searchParams.get(key)?.trim() ||
        ""
    );
}

function uniqueIds(ids: unknown) {
    return normalizeIdList(ids);
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.permissions", action: "create" })
)(async (req: AuthRequest) => {
    const { name, description, accesses, assignedToUsers } = await req.json();
    const assignedUserIds = uniqueIds(assignedToUsers);

    if (!name || !accesses?.length) {
        return NextResponse.json({ message: "نام و اکسس‌ها الزامی هستند." }, { status: 400 });
    }

    const conflicts = await findExistingActivePermissionAssignments(
        assignedUserIds,
    );
    if (conflicts.length > 0) {
        return NextResponse.json(
            {
                code: "USER_ALREADY_HAS_PERMISSION",
                message: buildPermissionAssignmentConflictMessage(conflicts),
            },
            { status: 409 },
        );
    }

    const permission = await Permission.create({
        name,
        description,
        accesses,
        assignedToUsers: assignedUserIds,
        grantedBy: req.ctx.user!._id,
    });

    if (assignedUserIds.length > 0) {
        await User.updateMany(
            { _id: { $in: assignedUserIds } },
            { $addToSet: { permissions: permission._id } }
        );
        accessCache.delMany(assignedUserIds);
    }

    return NextResponse.json({ permission }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.permissions", action: "view" })
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const isActive = getFilterParam(searchParams, "isActive");
    const nameFilter = getFilterParam(searchParams, "name");
    const assignedUserFilter = getFilterParam(searchParams, "assignedToUsers");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, unknown> = {};
    if (isActive === "true" || isActive === "false") {
        query.isActive = isActive === "true";
    }
    if (nameFilter) {
        query.name = { $regex: escapeRegex(nameFilter), $options: "i" };
    }
    if (assignedUserFilter) {
        query.assignedToUsers = assignedUserFilter;
    }
    if (search) {
        const pattern = escapeRegex(search);
        query.$or = [
            { name: { $regex: pattern, $options: "i" } },
            { description: { $regex: pattern, $options: "i" } },
        ];
    }

    applyDateRangeFilters(query, searchParams, ["createdAt"]);
    const sortFields: Record<string, string> = {
        name: "name",
        isActive: "isActive",
        createdAt: "createdAt",
    };
    const sortField = sortFields[searchParams.get("sortKey") ?? ""] ?? "createdAt";
    const sortDirection = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const [permissions, total] = await Promise.all([
        Permission.find(query)
            .populate("accesses")
            .populate("assignedToUsers", "firstName lastName phoneNumber role")
            .populate("grantedBy", "firstName lastName phoneNumber role")
            .sort({ [sortField]: sortDirection, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Permission.countDocuments(query),
    ]);

    return NextResponse.json({ permissions, total, page, limit });
});
