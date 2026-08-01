import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withRole, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";
import {
  getActiveAutoPageAssignmentTarget,
  getAutoPageAssignmentTargetUserId,
  saveAutoPageAssignmentTargetUserId,
} from "@/lib/settings/autoPageAssignment";

export const GET = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
  withRole("admin", "superAdmin"),
)(async (req: AuthRequest) => {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("mode") === "options") {
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 100)));
    const users = await User.find({
      status: "active",
      isDeleted: { $ne: true },
    })
      .select("firstName lastName phoneNumber email role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      users: users.map((user) => ({
        id: String(user._id),
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phoneNumber: user.phoneNumber ?? "",
        email: user.email ?? "",
        role: user.role,
      })),
    });
  }

  const targetUserId = await getAutoPageAssignmentTargetUserId();
  const targetResult = await getActiveAutoPageAssignmentTarget();

  return NextResponse.json({
    targetUserId,
    targetUser: targetResult.ok ? targetResult.target : null,
    status: targetResult.ok
      ? "ready"
      : targetUserId
        ? "invalid"
        : "not_configured",
    message: targetResult.ok ? "" : targetResult.message,
  });
});

export const PATCH = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
  withRole("admin", "superAdmin"),
)(async (req: AuthRequest) => {
  const body = await req.json().catch(() => ({}));
  const targetUserId =
    typeof body.targetUserId === "string" ? body.targetUserId.trim() : "";

  try {
    const saved = await saveAutoPageAssignmentTargetUserId({
      targetUserId,
      updatedBy: req.ctx.user!._id,
    });

    const targetResult = await getActiveAutoPageAssignmentTarget();

    return NextResponse.json({
      ...saved,
      targetUser: targetResult.ok ? targetResult.target : null,
      status: targetResult.ok
        ? "ready"
        : saved.targetUserId
          ? "invalid"
          : "not_configured",
      message: targetResult.ok ? "" : targetResult.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: "AUTO_ASSIGN_SETTING_INVALID",
        message:
          error instanceof Error
            ? error.message
            : "ذخیره تنظیمات تخصیص خودکار انجام نشد.",
      },
      { status: 400 },
    );
  }
});
