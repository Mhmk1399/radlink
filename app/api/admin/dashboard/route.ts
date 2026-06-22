import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withStatus } from "@/lib/auth/middlewares";
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
)(async (_req: AuthRequest) => {
  const last30Days = getDateDaysAgo(30);
  const previous30Days = getDateDaysAgo(60);
  const activeUserQuery = { isDeleted: { $ne: true } };

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
    User.countDocuments(activeUserQuery),
    User.countDocuments({ ...activeUserQuery, status: "active" }),
    User.countDocuments({ ...activeUserQuery, createdAt: { $gte: last30Days } }),
    User.countDocuments({
      ...activeUserQuery,
      createdAt: { $gte: previous30Days, $lt: last30Days },
    }),
    Agent.countDocuments(),
    Agent.countDocuments({ isActive: true }),
    Block.countDocuments(),
    Block.countDocuments({ isActive: true }),
    Page.countDocuments(),
    Page.countDocuments({ isPublished: true }),
    Template.countDocuments(),
    Template.countDocuments({ isActive: true }),
    Ticket.countDocuments({ status: { $ne: "closed" } }),
    Ticket.countDocuments(),
    QR.countDocuments(),
    QR.countDocuments({ isActive: true }),
    Product.countDocuments(),
    FileModel.countDocuments(),
    Notification.countDocuments(),
    Page.aggregate([{ $group: { _id: null, total: { $sum: "$stats.views" } } }]),
    Page.aggregate([
      { $group: { _id: null, total: { $sum: "$stats.visitors" } } },
    ]),
    User.find(activeUserQuery)
      .select("firstName lastName phoneNumber email role status createdAt")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    Ticket.find()
      .populate("requester", "firstName lastName phoneNumber email")
      .select("title status priority requester createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean(),
  ]);

  const totalPageViews = sumAggregationValue(pageViewsAggregation);
  const totalPageVisitors = sumAggregationValue(pageVisitorsAggregation);

  return NextResponse.json({
    stats: {
      users: {
        total: totalUsers,
        active: activeUsers,
        newLast30Days: newUsersLast30,
        changePercent: percentChange(newUsersLast30, newUsersPrevious30),
      },
      agents: {
        total: totalAgents,
        active: activeAgents,
      },
      blocks: {
        total: totalBlocks,
        active: activeBlocks,
      },
      pages: {
        total: totalPages,
        published: publishedPages,
        totalViews: totalPageViews,
        totalVisitors: totalPageVisitors,
      },
      templates: {
        total: totalTemplates,
        active: activeTemplates,
      },
      tickets: {
        total: totalTickets,
        open: openTickets,
      },
      qrcodes: {
        total: totalQrcodes,
        active: activeQrcodes,
      },
      products: {
        total: totalProducts,
      },
      files: {
        total: totalFiles,
      },
      notifications: {
        total: totalNotifications,
      },
    },
    recentUsers,
    recentTickets,
    generatedAt: new Date().toISOString(),
  });
});
