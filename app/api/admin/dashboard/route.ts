import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withStatus } from "@/lib/auth/middlewares";
import { hasGlobalOwnerScope } from "@/lib/auth/ownership";
import { getManagedUserIds } from "@/lib/auth/agentScope";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import type { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";
import Agent from "@/models/agent";
import Block from "@/models/blocks";
import Page from "@/models/pages";
import Template from "@/models/template";
import Ticket from "@/models/tickets";
import QR from "@/models/qr";
import Product from "@/models/products";
import FileModel from "@/models/files";
import Notification from "@/models/notification";

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function sumAggregationValue(value: unknown) {
  if (!Array.isArray(value)) return 0;
  const first = value[0] as Record<string, unknown> | undefined;
  const total = Number(first?.total ?? 0);
  return Number.isFinite(total) ? total : 0;
}

export const GET = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
)(async (req: AuthRequest) => {
  const user = req.ctx.user!;
  const isSuperAdmin = user.role === "superAdmin";
  const hasGlobalScope = hasGlobalOwnerScope(user);
  const access = await resolveUserAccess(String(user._id), user.permissions);
  const canView = (component: string) =>
    isSuperAdmin || (access.components[component]?.has("view") ?? false);

  const last30Days = getDateDaysAgo(30);
  const previous30Days = getDateDaysAgo(60);
  const managedUserIds = hasGlobalScope ? null : await getManagedUserIds(user);
  const scopedUserIds = managedUserIds ?? [user._id];
  const activeUserQuery: Record<string, unknown> = {
    isDeleted: { $ne: true },
    ...(!hasGlobalScope
      ? {
          _id: {
            $in:
              user.role === "agent"
                ? scopedUserIds.filter(
                    (id) => String(id) !== String(user._id),
                  )
                : scopedUserIds,
          },
        }
      : {}),
  };
  const ownerQuery = hasGlobalScope
    ? {}
    : { owner: { $in: scopedUserIds } };
  const ticketQuery = hasGlobalScope
    ? {}
    : { requester: { $in: scopedUserIds } };
  const agentQuery = hasGlobalScope ? {} : { user: user._id };
  const pageQuery = ownerQuery;
  const grantedTemplateIds = hasGlobalScope
    ? null
    : Object.entries(access.templates)
        .filter(([, actions]) => actions.has("view"))
        .map(([id]) => id);
  const templateQuery =
    grantedTemplateIds === null
      ? {}
      : { _id: { $in: grantedTemplateIds } };
  const grantedBlockIds = hasGlobalScope
    ? null
    : Object.entries(access.blocks)
        .filter(([, actions]) => actions.has("view"))
        .map(([id]) => id);
  const blockQuery =
    grantedBlockIds === null ? {} : { _id: { $in: grantedBlockIds } };

  const canUsers = canView("admin.users");
  const canAgents = canView("admin.agents");
  const canBlocks = canView("admin.blocks");
  const canPages = canView("admin.pages");
  const canTemplates = canView("admin.templates");
  const canTickets = canView("admin.tickets");
  const canQrcodes = canView("admin.qrcodes");
  const canProducts = canView("admin.products");
  const canFiles = canView("admin.files");
  const canNotifications = canView("admin.notifications");
  const notificationPageIds =
    canNotifications && !hasGlobalScope
      ? await Page.distinct("_id", pageQuery)
      : [];
  const notificationQuery = hasGlobalScope
    ? { isActive: { $ne: false } }
    : {
        isActive: { $ne: false },
        ...(user.role === "agent"
          ? { page: { $in: notificationPageIds } }
          : {
              $or: [
                { isGlobal: true },
                { page: { $in: notificationPageIds } },
              ],
            }),
      };

  const [
    totalUsers,
    activeUsers,
    newUsersLast30,
    newUsersPrevious30,
    totalAgents,
    activeAgents,
    totalBlocks,
    activeBlocks,
    totalPages,
    publishedPages,
    totalTemplates,
    activeTemplates,
    openTickets,
    totalTickets,
    totalQrcodes,
    activeQrcodes,
    totalProducts,
    totalFiles,
    totalNotifications,
    pageViewsAggregation,
    pageVisitorsAggregation,
    recentUsers,
    recentTickets,
  ] = await Promise.all([
    canUsers ? User.countDocuments(activeUserQuery) : 0,
    canUsers
      ? User.countDocuments({ ...activeUserQuery, status: "active" })
      : 0,
    canUsers
      ? User.countDocuments({
          ...activeUserQuery,
          createdAt: { $gte: last30Days },
        })
      : 0,
    canUsers
      ? User.countDocuments({
          ...activeUserQuery,
          createdAt: { $gte: previous30Days, $lt: last30Days },
        })
      : 0,
    canAgents ? Agent.countDocuments(agentQuery) : 0,
    canAgents
      ? Agent.countDocuments({ ...agentQuery, isActive: true })
      : 0,
    canBlocks ? Block.countDocuments(blockQuery) : 0,
    canBlocks ? Block.countDocuments({ ...blockQuery, isActive: true }) : 0,
    canPages ? Page.countDocuments(pageQuery) : 0,
    canPages
      ? Page.countDocuments({ $and: [pageQuery, { isPublished: true }] })
      : 0,
    canTemplates ? Template.countDocuments(templateQuery) : 0,
    canTemplates
      ? Template.countDocuments({
          $and: [templateQuery, { isActive: true }],
        })
      : 0,
    canTickets
      ? Ticket.countDocuments({ ...ticketQuery, status: { $ne: "closed" } })
      : 0,
    canTickets ? Ticket.countDocuments(ticketQuery) : 0,
    canQrcodes ? QR.countDocuments(ownerQuery) : 0,
    canQrcodes
      ? QR.countDocuments({ ...ownerQuery, isActive: true })
      : 0,
    canProducts ? Product.countDocuments(ownerQuery) : 0,
    canFiles ? FileModel.countDocuments(ownerQuery) : 0,
    canNotifications
      ? Notification.countDocuments(notificationQuery)
      : 0,
    canPages
      ? Page.aggregate([
          { $match: pageQuery },
          { $group: { _id: null, total: { $sum: "$stats.views" } } },
        ])
      : [],
    canPages
      ? Page.aggregate([
          { $match: pageQuery },
          { $group: { _id: null, total: { $sum: "$stats.visitors" } } },
        ])
      : [],
    isSuperAdmin
      ? User.find(activeUserQuery)
          .select("firstName lastName phoneNumber email role status createdAt")
          .sort({ createdAt: -1 })
          .limit(4)
          .lean()
      : [],
    isSuperAdmin
      ? Ticket.find()
          .populate("requester", "firstName lastName phoneNumber email")
          .select("title status priority requester createdAt updatedAt")
          .sort({ updatedAt: -1 })
          .limit(4)
          .lean()
      : [],
  ]);

  return NextResponse.json({
    stats: {
      users: {
        total: totalUsers,
        active: activeUsers,
        newLast30Days: newUsersLast30,
        changePercent: percentChange(newUsersLast30, newUsersPrevious30),
      },
      agents: { total: totalAgents, active: activeAgents },
      blocks: { total: totalBlocks, active: activeBlocks },
      pages: {
        total: totalPages,
        published: publishedPages,
        totalViews: sumAggregationValue(pageViewsAggregation),
        totalVisitors: sumAggregationValue(pageVisitorsAggregation),
      },
      templates: { total: totalTemplates, active: activeTemplates },
      tickets: { total: totalTickets, open: openTickets },
      qrcodes: { total: totalQrcodes, active: activeQrcodes },
      products: { total: totalProducts },
      files: { total: totalFiles },
      notifications: { total: totalNotifications },
    },
    recentUsers,
    recentTickets,
    generatedAt: new Date().toISOString(),
  });
});
