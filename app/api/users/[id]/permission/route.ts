import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole, withPermission } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";
import Permission from "@/models/permission";
import { accessCache } from "@/lib/auth/accessCache";
import { invalidateActorScope } from "@/lib/auth/agentScope";

type Context = { params: Promise<{ id: string }> };
class AssignmentError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
function checkTarget(user: { role: string } | null, req: AuthRequest) {
  if (!user) throw new AssignmentError("کاربر یافت نشد.", 404);
  if (user.role === "superAdmin" && req.ctx.user?.role !== "superAdmin") {
    throw new AssignmentError("اجازه تغییر دسترسی این کاربر را ندارید.", 403);
  }
}
function errorResponse(error: unknown) {
  if (error instanceof AssignmentError) return NextResponse.json({ message: error.message }, { status: error.status });
  console.error("User permission assignment failed", error);
  return NextResponse.json({ message: "ذخیره یا دریافت دسترسی انجام نشد. دوباره تلاش کنید." }, { status: 500 });
}
const base = () => [withDB(), withAuth(), withStatus("active"), withRole("admin", "superAdmin"), withPermission({ component: "admin.permissions", action: "view" })];

export const GET = compose(...base())(async (req: AuthRequest, ctx: Context) => {
  try {
    const { id } = await ctx.params;
    if (!mongoose.isObjectIdOrHexString(id)) throw new AssignmentError("شناسه کاربر نامعتبر است.", 400);
    const user = await User.findOne({ _id: id, isDeleted: { $ne: true } }).select("role permissions");
    checkTarget(user, req);
    const permissions = await Permission.find({ $or: [
      { isActive: true }, { _id: { $in: user!.permissions } }, { assignedToUsers: id },
    ] }).select("name description isActive assignedToUsers").sort({ name: 1 }).lean();
    const currentPermissionIds = permissions.filter(p =>
      user!.permissions.some(value => String(value) === String(p._id)) || p.assignedToUsers.some(value => String(value) === id),
    ).map(p => String(p._id));
    return NextResponse.json({ currentPermissionIds, permissions: permissions.map(p => ({
      _id: String(p._id), name: p.name, description: p.description, isActive: p.isActive,
    })) });
  } catch (error) { return errorResponse(error); }
});

export const PUT = compose(...base(), withPermission({ component: "admin.permissions", action: "update" }))(
  async (req: AuthRequest, ctx: Context) => {
    try {
      const { id } = await ctx.params;
      if (!mongoose.isObjectIdOrHexString(id)) throw new AssignmentError("شناسه کاربر نامعتبر است.", 400);
      const body = await req.json().catch(() => null);
      if (!body || !(body.permissionId === null || (typeof body.permissionId === "string" && mongoose.isObjectIdOrHexString(body.permissionId)))) {
        throw new AssignmentError("یک دسترسی معتبر انتخاب کنید.", 400);
      }
      const permissionId: string | null = body.permissionId;
      await mongoose.connection.transaction(async session => {
        const user = await User.findOne({ _id: id, isDeleted: { $ne: true } }).session(session);
        checkTarget(user, req);
        if (permissionId && !await Permission.exists({ _id: permissionId, isActive: true }).session(session)) {
          throw new AssignmentError("دسترسی انتخاب‌شده فعال نیست یا یافت نشد.", 400);
        }
        // Write the user first so concurrent assignments to the same user retry together.
        await User.updateOne({ _id: id }, { $set: { permissions: permissionId ? [permissionId] : [], updatedBy: req.ctx.user?._id } }, { session });
        await Permission.updateMany({ assignedToUsers: id }, { $pull: { assignedToUsers: id } }, { session });
        if (permissionId) await Permission.updateOne({ _id: permissionId }, { $addToSet: { assignedToUsers: id } }, { session });
      });
      accessCache.del(id);
      invalidateActorScope([id]);
      return NextResponse.json({ message: "دسترسی کاربر ذخیره شد." });
    } catch (error) { return errorResponse(error); }
  },
);
