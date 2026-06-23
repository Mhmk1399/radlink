"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
   FaFile,
  FaPaperPlane,
  FaPaperclip,
  FaPlus,
  FaReply,
  FaTicket,
  FaXmark,
  FaCircleInfo,
  FaMessage,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import CustomSelect, { type SelectOption } from "@/components/ui/customSelect";
import { toast } from "@/components/ui/CustomToast";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import type { ColumnDef } from "@/types/table";

/* ── types ── */
type TicketStatus = "open" | "in_progress" | "closed";
type TicketPriority = "low" | "medium" | "high";
type UserRef = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
  status?: string;
};
type FileRef = { _id?: string; id?: string; filename?: string; path?: string };
type TicketReply = {
  _id?: string;
  author?: UserRef | string;
  message: string;
  isStaff?: boolean;
  createdAt?: string;
  attachments: FileRef[];
};
type TicketRow = {
  _id: string;
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester?: UserRef | string;
  requesterId: string;
  requesterLabel: string;
  assignee?: UserRef | string;
  assigneeId: string;
  assigneeLabel: string;
  replies: TicketReply[];
  replyCount: number;
  lastReplyAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};
type TicketFormState = {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterId: string;
  assigneeId: string;
  replyMessage: string;
};
type UploadedTicketFile = { id: string; filename: string; path: string };
type CreateTicketFormState = {
  title: string;
  description: string;
  priority: TicketPriority;
};

const statusOptions: SelectOption[] = [
  { value: "open", label: "باز" },
  { value: "in_progress", label: "در حال بررسی" },
  { value: "closed", label: "بسته شده" },
];
const priorityOptions: SelectOption[] = [
  { value: "low", label: "کم" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "زیاد" },
];

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function toText(v: unknown) {
  return typeof v === "string" ? v : "";
}
function getId(v: unknown) {
  if (typeof v === "string") return v;
  if (!isRecord(v)) return "";
  const id = v._id ?? v.id;
  return typeof id === "string" ? id : "";
}
function userLabel(v: unknown, fallback = "-") {
  if (!isRecord(v)) return fallback;
  const name = [v.firstName, v.lastName]
    .filter((i) => typeof i === "string" && (i as string).trim())
    .join(" ")
    .trim();
  return (
    name || toText(v.phoneNumber) || toText(v.email) || getId(v) || fallback
  );
}
function formatFaDate(v?: string) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("fa-IR");
  } catch {
    return String(v);
  }
}
function formatRelativeDate(v?: string) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "لحظاتی پیش";
    if (mins < 60) return `${mins} دقیقه پیش`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ساعت پیش`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} روز پیش`;
    return new Date(v).toLocaleDateString("fa-IR");
  } catch {
    return String(v);
  }
}
function statusLabel(s: TicketStatus) {
  return statusOptions.find((i) => i.value === s)?.label ?? s;
}
function priorityLabel(p: TicketPriority) {
  return priorityOptions.find((i) => i.value === p)?.label ?? p;
}

/* ── Badges ── */
function StatusBadge({ status }: { status: TicketStatus }) {
  const cls =
    status === "closed"
      ? "bg-[#6e6a62]/10 text-[#9c9890] ring-1 ring-[#6e6a62]/15"
      : status === "in_progress"
        ? "bg-blue-500/[0.08] text-blue-400 ring-1 ring-blue-500/15"
        : "bg-emerald-500/[0.08] text-emerald-400 ring-1 ring-emerald-500/15";
  const dot =
    status === "closed"
      ? "bg-[#9c9890]"
      : status === "in_progress"
        ? "bg-blue-400"
        : "bg-emerald-400";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        cls,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {statusLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const cls =
    priority === "high"
      ? "bg-red-500/[0.08] text-red-400 ring-1 ring-red-500/15"
      : priority === "medium"
        ? "bg-amber-500/[0.08] text-amber-400 ring-1 ring-amber-500/15"
        : "bg-[#6e6a62]/10 text-[#9c9890] ring-1 ring-[#6e6a62]/15";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        cls,
      )}
    >
      {priorityLabel(priority)}
    </span>
  );
}

/* ── Normalization helpers ── */
function normalizeTicket(value: unknown): TicketRow | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  if (!id) return null;
  const requesterId = getId(value.requester) || toText(value.requesterId);
  const assigneeId = getId(value.assignee) || toText(value.assigneeId);
  const replies = Array.isArray(value.replies)
    ? value.replies.filter(isRecord).map((r) => ({
        _id: getId(r) || undefined,
        author: r.author as UserRef | string | undefined,
        message: toText(r.message),
        isStaff: r.isStaff === true,
        createdAt: toText(r.createdAt),
        attachments: Array.isArray(r.attachments)
          ? r.attachments.filter(isRecord).map((f) => ({
              _id: getId(f),
              id: getId(f),
              filename: toText(f.filename) || "file",
              path: toText(f.path),
            }))
          : [],
      }))
    : [];
  return {
    ...value,
    _id: id,
    id,
    title: toText(value.title) || "-",
    description: toText(value.description),
    status: ["open", "in_progress", "closed"].includes(String(value.status))
      ? (value.status as TicketStatus)
      : "open",
    priority: ["low", "medium", "high"].includes(String(value.priority))
      ? (value.priority as TicketPriority)
      : "medium",
    requester: value.requester as UserRef | string | undefined,
    requesterId,
    requesterLabel: userLabel(value.requester, requesterId || "-"),
    assignee: value.assignee as UserRef | string | undefined,
    assigneeId,
    assigneeLabel: assigneeId
      ? userLabel(value.assignee, assigneeId)
      : "بدون مسئول",
    replies,
    replyCount: replies.length,
    lastReplyAt: toText(value.lastReplyAt),
    createdAt: toText(value.createdAt),
    updatedAt: toText(value.updatedAt),
  };
}
function formFromTicket(t: TicketRow): TicketFormState {
  return {
    title: t.title === "-" ? "" : t.title,
    description: t.description ?? "",
    status: t.status,
    priority: t.priority,
    requesterId: t.requesterId,
    assigneeId: t.assigneeId,
    replyMessage: "",
  };
}
function emptyCreateForm(): CreateTicketFormState {
  return { title: "", description: "", priority: "medium" };
}
function usersToOptions(value: unknown): SelectOption[] {
  const users =
    isRecord(value) && Array.isArray(value.users) ? value.users : [];
  return users
    .filter(isRecord)
    .map((u) => {
      const id = getId(u);
      const label = userLabel(u, id);
      return {
        value: id,
        label,
        description: [toText(u.phoneNumber), toText(u.role)]
          .filter(Boolean)
          .join(" | "),
      };
    })
    .filter((i) => i.value);
}
function normalizeUploadedFile(value: unknown): UploadedTicketFile | null {
  if (!isRecord(value)) return null;
  const data = isRecord(value.data) ? value.data : {};
  const file = isRecord(value.file)
    ? value.file
    : isRecord(data.file)
      ? data.file
      : null;
  const id = getId(file) || toText(data.fileId);
  const path =
    (file ? toText(file.path) : "") || toText(data.url) || toText(value.url);
  const filename =
    (file ? toText(file.filename) : "") || toText(data.originalName) || "file";
  if (!id || !path) return null;
  return { id, filename, path };
}

type DetailTab = "conversation" | "settings";

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export default function TicketsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { isSuperAdmin } = useAccess();

  const [tableKey, setTableKey] = useState(0);
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [form, setForm] = useState<TicketFormState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadedAttachments, setUploadedAttachments] = useState<
    UploadedTicketFile[]
  >([]);
  const [createForm, setCreateForm] =
    useState<CreateTicketFormState>(emptyCreateForm);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>("conversation");
  const repliesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );
  const isTicketClosed = selectedTicket?.status === "closed";
  const closedTicketMessage =
    "این تیکت بسته شده است و امکان ارسال پیام یا فایل جدید وجود ندارد.";

  const transformResponse = useMemo(
    () =>
      (json: unknown): TicketRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.tickets)
            ? json.tickets
            : Array.isArray(json)
              ? json
              : [];
        return raw.map(normalizeTicket).filter((r): r is TicketRow => !!r);
      },
    [],
  );

  useEffect(() => {
    if (
      modalOpen &&
      selectedTicket &&
      !detailLoading &&
      activeTab === "conversation"
    ) {
      setTimeout(() => {
        repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [modalOpen, selectedTicket, detailLoading, activeTab]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen || createModalOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalOpen, createModalOpen]);

  const columns: ColumnDef<TicketRow>[] = useMemo(
    () => [
      {
        key: "title",
        label: "موضوع",
        sortable: true,
        copyable: true,
        render: (value, row) => (
          <span className="flex items-start gap-3 py-1">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                row.status === "closed"
                  ? "bg-[#6e6a62]/10 text-[#9c9890]"
                  : row.status === "in_progress"
                    ? "bg-blue-500/[0.08] text-blue-400"
                    : "bg-emerald-500/[0.08] text-emerald-400",
              )}
            >
              <FaTicket className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate font-semibold leading-tight",
                  t.textPrimary,
                )}
              >
                {String(value || "-")}
              </span>
              {row.description ? (
                <span
                  className={cn(
                    "mt-0.5 block truncate text-xs leading-tight",
                    t.textDisabled,
                  )}
                >
                  {row.description.slice(0, 60)}
                  {row.description.length > 60 ? "..." : ""}
                </span>
              ) : null}
            </span>
          </span>
        ),
      },
      {
        key: "status",
        label: "وضعیت",
        filterable: true,
        options: statusOptions,
        render: (v) => <StatusBadge status={v as TicketStatus} />,
      },
      {
        key: "priority",
        label: "اولویت",
        filterable: true,
        options: priorityOptions,
        render: (v) => <PriorityBadge priority={v as TicketPriority} />,
      },
      {
        key: "requesterLabel",
        label: "درخواست‌دهنده",
        sortable: true,
        hideOnMobile: true,
        render: (v) => (
          <span className={cn("text-sm", t.textMuted)}>{String(v || "-")}</span>
        ),
      },
      {
        key: "assigneeLabel",
        label: "مسئول",
        sortable: true,
        hideOnMobile: true,
        render: (v) => (
          <span className={cn("text-sm", t.textMuted)}>{String(v || "-")}</span>
        ),
        
      },
      {
        key: "replyCount",
        label: "پاسخ‌ها",
        sortable: true,
        hideOnMobile: true,
        render: (v) => (
          <span className="inline-flex items-center gap-1.5">
            <FaMessage className={cn("h-3 w-3", t.textDisabled)} />
            <span className={cn("font-mono text-sm", t.textMuted)}>
              {String(v ?? 0)}
            </span>
          </span>
        ),
      },
      {
        key: "createdAt",
        label: "تاریخ",
        sortable: true,
        hideOnMobile: true,
        render: (v) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {formatRelativeDate(String(v || ""))}
          </span>
        ),
      },
    ],
    [t],
  );

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    async function loadUsers() {
      try {
        const r = await fetch("/api/users?limit=100", { headers });
        const json = await r.json().catch(() => null);
        if (!r.ok) throw new Error(json?.message ?? "خطا در دریافت کاربران");
        if (!cancelled) setUserOptions(usersToOptions(json));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "خطا در دریافت کاربران");
      }
    }
    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [headers, isSuperAdmin]);

  function refreshTable() {
    setTableKey((v) => v + 1);
    setRefreshToken((v) => v + 1);
  }
  function openCreateTicket() {
    setCreateForm(emptyCreateForm());
    setCreateModalOpen(true);
  }

  async function createTicket() {
    if (isSuperAdmin) {
      toast.error("سوپرادمین امکان ثبت تیکت ندارد.");
      return;
    }
    const title = createForm.title.trim();
    if (!title) {
      toast.error("عنوان تیکت الزامی است.");
      return;
    }
    try {
      setCreating(true);
      const r = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(headers ?? {}) },
        body: JSON.stringify({
          title,
          description: createForm.description.trim(),
          priority: createForm.priority,
        }),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) throw new Error(json?.message ?? "خطا در ثبت تیکت");
      toast.success("تیکت جدید ثبت شد");
      setCreateModalOpen(false);
      setCreateForm(emptyCreateForm());
      refreshTable();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت تیکت");
    } finally {
      setCreating(false);
    }
  }

  async function uploadTicketAttachment(file: File | null | undefined) {
    if (!file) return;
    if (isTicketClosed) {
      toast.error(closedTicketMessage);
      return;
    }
    try {
      setUploadingAttachment(true);
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/uploads", {
        method: "POST",
        headers,
        body: fd,
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) throw new Error(json?.message ?? "خطا در آپلود فایل");
      const uploaded = normalizeUploadedFile(json);
      if (!uploaded)
        throw new Error("شناسه فایل آپلود شده از سرور دریافت نشد.");
      setUploadedAttachments((prev) => [...prev, uploaded]);
      toast.success("فایل به پیام پیوست شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در آپلود فایل");
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function openTicket(row: TicketRow) {
    setSelectedTicket(row);
    setForm(formFromTicket(row));
    setUploadedAttachments([]);
    setActiveTab("conversation");
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const r = await fetch(`/api/tickets/${row._id}`, { headers });
      const json = await r.json().catch(() => null);
      if (!r.ok) throw new Error(json?.message ?? "خطا در دریافت جزئیات تیکت");
      const ticket = normalizeTicket(json?.ticket);
      if (ticket) {
        setSelectedTicket(ticket);
        setForm(formFromTicket(ticket));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در دریافت جزئیات تیکت");
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveTicket() {
    if (!selectedTicket || !form) return;
    const hasConversationPayload =
      Boolean(form.replyMessage.trim()) || uploadedAttachments.length > 0;
    if (selectedTicket.status === "closed" && hasConversationPayload) {
      toast.error(closedTicketMessage);
      return;
    }
    if (
      !hasConversationPayload &&
      !isSuperAdmin
    ) {
      toast.error("متن پیام یا فایل پیوست را وارد کنید.");
      return;
    }
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        replyMessage: form.replyMessage,
        replyAttachments: uploadedAttachments.map((f) => f.id),
      };
      if (isSuperAdmin) {
        payload.title = form.title;
        payload.description = form.description;
        payload.status = form.status;
        payload.priority = form.priority;
        payload.assigneeId = form.assigneeId || null;
      }
      const r = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(headers ?? {}) },
        body: JSON.stringify(payload),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) throw new Error(json?.message ?? "خطا در ذخیره تیکت");
      const ticket = normalizeTicket(json?.ticket);
      if (ticket) {
        setSelectedTicket(ticket);
        setForm(formFromTicket(ticket));
      }
      setUploadedAttachments([]);
      toast.success(
        form.replyMessage.trim() ? "پاسخ ثبت شد" : "تیکت به‌روزرسانی شد",
      );
      refreshTable();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ذخیره تیکت");
    } finally {
      setSaving(false);
    }
  }

  const requesterOptions = useMemo(() => {
    if (!selectedTicket) return userOptions;
    const cur = selectedTicket.requesterId
      ? [
          {
            value: selectedTicket.requesterId,
            label: selectedTicket.requesterLabel,
          },
        ]
      : [];
    const merged = [...cur, ...userOptions];
    return merged.filter(
      (i, idx, arr) =>
        i.value && arr.findIndex((o) => o.value === i.value) === idx,
    );
  }, [selectedTicket, userOptions]);

  const assigneeOptions = useMemo(() => {
    if (!selectedTicket) return userOptions;
    const cur = selectedTicket.assigneeId
      ? [
          {
            value: selectedTicket.assigneeId,
            label: selectedTicket.assigneeLabel,
          },
        ]
      : [];
    const merged = [...cur, ...userOptions];
    return merged.filter(
      (i, idx, arr) =>
        i.value && arr.findIndex((o) => o.value === i.value) === idx,
    );
  }, [selectedTicket, userOptions]);

  /* ── Shared classes ── */
  const fieldLabel = cn(
    "mb-1.5 block text-xs font-semibold uppercase tracking-wider",
    t.textDisabled,
  );
  const fieldInput = cn(
    "w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-all duration-200",
    t.inputBg,
    t.borderInput,
    t.textPrimary,
    t.borderInputFocus,
    isDark ? "placeholder:text-[#47443e]" : "placeholder:text-[#b0aa9e]",
  );
  const closeBtn = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
    t.hoverBg,
    t.textMuted,
  );
  const primaryBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    isDark
      ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
      : "bg-[#8a7030] text-white hover:bg-[#7a6428]",
  );
  const outlineBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    t.borderSubtle,
    t.inputBg,
    t.textMuted,
    isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
  );

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      {/* ── Page header ── */}
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-6",
          t.borderSubtle,
          t.modalBg,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                isDark
                  ? "border-blue-500/15 bg-blue-500/[0.08] text-blue-400"
                  : "border-blue-500/20 bg-blue-500/[0.06] text-blue-600",
              )}
            >
              <FaTicket className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت تیکت‌ها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                {isSuperAdmin
                  ? "مشاهده، پاسخ‌دهی و مدیریت تمامی تیکت‌ها"
                  : "مشاهده و پیگیری تیکت‌های شما"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isSuperAdmin && (
              <button
                type="button"
                onClick={openCreateTicket}
                className={cn(primaryBtn, "h-11 flex-1 sm:flex-none")}
              >
                <FaPlus className="h-3.5 w-3.5" />
                <span>ثبت تیکت</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("dashboard")}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200",
                t.borderAccent,
                t.textAccent,
                t.hoverBg,
              )}
            >
              <FaArrowRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">بازگشت به داشبورد</span>
              <span className="sm:hidden">بازگشت</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <DynamicTable<TicketRow>
        key={tableKey}
        endpoint={`/api/tickets?refresh=${refreshToken}`}
        columns={columns}
        title="لیست تیکت‌ها"
        subtitle={
          isSuperAdmin
            ? "سوپرادمین همه تیکت‌ها را می‌بیند"
            : "فقط تیکت‌های خودتان نمایش داده می‌شود"
        }
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[20, 50, 100]}
        searchable
        exportable
        exportFileName="tickets"
        stickyHeader
        showRowNumbers
        doubleClickToEdit
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete={isSuperAdmin}
        transformResponse={transformResponse}
        onDelete={async (item, del) => {
          await del(item);
          toast.success("تیکت حذف شد");
          refreshTable();
        }}
        rowActions={(row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void openTicket(row);
            }}
            title={isSuperAdmin ? "مشاهده و پاسخ" : "مشاهده"}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
              isDark
                ? "text-blue-400/70 hover:bg-blue-500/10 hover:text-blue-400"
                : "text-blue-600/70 hover:bg-blue-500/8 hover:text-blue-600",
            )}
          >
            {isSuperAdmin ? (
              <FaReply className="h-3.5 w-3.5" />
            ) : (
              <FaReply className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">
              {isSuperAdmin ? "مشاهده و پاسخ" : "مشاهده"}
            </span>
          </button>
        )}
        emptyMessage="تیکتی یافت نشد."
      />

      {/* ══════════════════════════════════════════════
          CREATE MODAL — Full screen on mobile
          ══════════════════════════════════════════════ */}
      {createModalOpen && !isSuperAdmin && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            isDark
              ? "bg-[#0a0a0e]/80 backdrop-blur-md"
              : "bg-[#2a2720]/40 backdrop-blur-md",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateModalOpen(false);
          }}
        >
          <section
            className={cn(
              // Mobile: full screen | Desktop: centered card
              "flex flex-col",
              "h-full w-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg",
              "sm:rounded-2xl",
              "overflow-hidden border-0 sm:border",
              t.modalBg,
              t.borderSubtle,
              t.dropdownShadow,
            )}
          >
            {/* Header */}
            <header
              className={cn(
                "flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4",
                t.divider,
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    isDark
                      ? "bg-[#c8a84b]/10 text-[#c8a84b]"
                      : "bg-[#8a7030]/10 text-[#8a7030]",
                  )}
                >
                  <FaPlus className="h-4 w-4" />
                </div>
                <div>
                  <h2 className={cn("text-base font-bold", t.textPrimary)}>
                    ثبت تیکت جدید
                  </h2>
                  <p className={cn("text-xs", t.textDisabled)}>
                    درخواست شما ثبت و بررسی خواهد شد
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className={closeBtn}
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </header>

            {/* Body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              <div>
                <label className={fieldLabel}>عنوان تیکت</label>
                <input
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="مثلاً: مشکل در ورود به حساب"
                  className={fieldInput}
                  autoFocus
                />
              </div>

              <CustomSelect
                label="اولویت"
                options={priorityOptions}
                value={createForm.priority}
                disabled={creating}
                onChange={(v) =>
                  setCreateForm((p) => ({
                    ...p,
                    priority: String(v) as TicketPriority,
                  }))
                }
              />

              <div>
                <label className={fieldLabel}>توضیحات</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="جزئیات درخواست خود را شرح دهید..."
                  className={cn(fieldInput, "resize-none")}
                />
              </div>
            </div>

            {/* Footer — sticky at bottom */}
            <div
              className={cn(
                "flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end",
                t.divider,
                t.modalBg,
              )}
            >
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                disabled={creating}
                className={cn(outlineBtn, "w-full sm:w-auto")}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={createTicket}
                disabled={creating}
                className={cn(primaryBtn, "w-full sm:w-auto")}
              >
                <FaPaperPlane className="h-4 w-4" />
                {creating ? "در حال ثبت..." : "ثبت تیکت"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          DETAIL / REPLY MODAL — Full screen everywhere
          ══════════════════════════════════════════════ */}
      {modalOpen && selectedTicket && form && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            isDark
              ? "bg-[#0a0a0e]/80 backdrop-blur-md"
              : "bg-[#2a2720]/40 backdrop-blur-md",
          )}
        >
          <section
            className={cn(
              "flex flex-col",
              // Mobile: absolute full screen | Desktop: large centered card
              "h-full w-full",
              "lg:h-[92vh] lg:max-h-[92vh] lg:w-[95vw] lg:max-w-6xl lg:rounded-2xl",
              "overflow-hidden lg:border",
              t.modalBg,
              t.borderSubtle,
              t.dropdownShadow,
            )}
          >
            {/* ── Modal Header ── */}
            <header
              className={cn(
                "flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-5 sm:py-3",
                t.divider,
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10",
                    selectedTicket.status === "closed"
                      ? "bg-[#6e6a62]/10 text-[#9c9890]"
                      : selectedTicket.status === "in_progress"
                        ? "bg-blue-500/[0.08] text-blue-400"
                        : "bg-emerald-500/[0.08] text-emerald-400",
                  )}
                >
                  <FaTicket className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2
                    className={cn(
                      "truncate text-sm font-bold sm:text-base",
                      t.textPrimary,
                    )}
                  >
                    {selectedTicket.title}
                  </h2>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={selectedTicket.status} />
                    <PriorityBadge priority={selectedTicket.priority} />
                    <span
                      className={cn(
                        "hidden text-[11px] sm:inline",
                        t.textDisabled,
                      )}
                    >
                      {formatRelativeDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={closeBtn}
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </header>

            {/* ── Mobile Tabs ── */}
            <div className={cn("flex shrink-0 border-b lg:hidden", t.divider)}>
              <button
                type="button"
                onClick={() => setActiveTab("conversation")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                  activeTab === "conversation"
                    ? cn(
                        "border-b-2",
                        isDark
                          ? "border-[#c8a84b] text-[#c8a84b]"
                          : "border-[#8a7030] text-[#8a7030]",
                      )
                    : cn("border-b-2 border-transparent", t.textMuted),
                )}
              >
                <FaMessage className="h-3.5 w-3.5" />
                <span>مکالمه</span>
                {selectedTicket.replyCount > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      isDark
                        ? "bg-[#c8a84b]/15 text-[#c8a84b]"
                        : "bg-[#8a7030]/10 text-[#8a7030]",
                    )}
                  >
                    {selectedTicket.replyCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                  activeTab === "settings"
                    ? cn(
                        "border-b-2",
                        isDark
                          ? "border-[#c8a84b] text-[#c8a84b]"
                          : "border-[#8a7030] text-[#8a7030]",
                      )
                    : cn("border-b-2 border-transparent", t.textMuted),
                )}
              >
                <FaCircleInfo className="h-3.5 w-3.5" />
                <span>اطلاعات</span>
              </button>
            </div>

            {/* ── Body grid ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* ── Conversation panel ── */}
              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-1 flex-col",
                  activeTab !== "conversation" && "hidden lg:flex",
                )}
              >
                {/* Scrollable replies area */}
                <div
                  className={cn(
                    "flex-1 overflow-y-auto p-3 sm:p-5",
                    t.scrollbarWide,
                  )}
                >
                  {/* Original description */}
                  {selectedTicket.description && (
                    <div
                      className={cn(
                        "mb-4 rounded-xl border p-3 sm:p-4",
                        t.borderSubtle,
                        t.inputBg,
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn("text-xs font-bold", t.textMuted)}>
                          {selectedTicket.requesterLabel}
                        </span>
                        <span className={cn("text-[11px]", t.textDisabled)}>
                          • توضیحات اولیه
                        </span>
                      </div>
                      <p
                        className={cn(
                          "whitespace-pre-wrap text-sm leading-7",
                          t.textSecondary,
                        )}
                      >
                        {selectedTicket.description}
                      </p>
                    </div>
                  )}

                  {/* Replies */}
                  {detailLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 animate-spin rounded-full border-2 border-t-transparent",
                            isDark ? "border-[#c8a84b]" : "border-[#8a7030]",
                          )}
                        />
                        <span className={cn("text-sm", t.textDisabled)}>
                          در حال دریافت...
                        </span>
                      </div>
                    </div>
                  ) : selectedTicket.replies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div
                        className={cn(
                          "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl",
                          t.inputBg,
                        )}
                      >
                        <FaMessage className={cn("h-6 w-6", t.textDisabled)} />
                      </div>
                      <p className={cn("text-sm font-medium", t.textMuted)}>
                        هنوز پاسخی ثبت نشده
                      </p>
                      <p className={cn("mt-1 text-xs", t.textDisabled)}>
                        اولین پاسخ را ارسال کنید
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTicket.replies.map((reply, i) => (
                        <article
                          key={reply._id ?? `${reply.createdAt}-${i}`}
                          className={cn(
                            "rounded-xl border p-3 sm:p-3.5 transition-colors duration-200",
                            reply.isStaff
                              ? isDark
                                ? "border-blue-500/15 bg-blue-500/[0.04]"
                                : "border-blue-500/12 bg-blue-500/[0.03]"
                              : cn(t.inputBg, t.borderSubtle),
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                reply.isStaff
                                  ? isDark
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "bg-blue-500/10 text-blue-600"
                                  : isDark
                                    ? "bg-[#c8a84b]/15 text-[#c8a84b]"
                                    : "bg-[#8a7030]/10 text-[#8a7030]",
                              )}
                            >
                              {reply.isStaff ? "پ" : "ک"}
                            </div>
                            <span
                              className={cn("text-xs font-bold", t.textPrimary)}
                            >
                              {reply.isStaff
                                ? "پشتیبانی"
                                : userLabel(reply.author)}
                            </span>
                            {reply.isStaff && (
                              <span
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                                  isDark
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-blue-500/8 text-blue-600",
                                )}
                              >
                                کارشناس
                              </span>
                            )}
                            <span
                              className={cn(
                                "mr-auto text-[11px]",
                                t.textDisabled,
                              )}
                            >
                              {formatRelativeDate(reply.createdAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "whitespace-pre-wrap text-sm leading-7 pr-9",
                              t.textSecondary,
                            )}
                          >
                            {reply.message}
                          </p>
                          {reply.attachments.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 pr-9">
                              {reply.attachments.map((file) => (
                                <a
                                  key={file._id ?? file.id ?? file.path}
                                  href={file.path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors duration-200",
                                    t.borderSubtle,
                                    t.inputBg,
                                    t.textMuted,
                                    isDark
                                      ? "hover:border-blue-500/25 hover:text-blue-400"
                                      : "hover:border-blue-500/20 hover:text-blue-600",
                                  )}
                                >
                                  <FaFile className="h-3 w-3 shrink-0" />
                                  <span className="max-w-[100px] truncate sm:max-w-[120px]">
                                    {file.filename ?? "file"}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                      <div ref={repliesEndRef} />
                    </div>
                  )}
                </div>

                {/* ── Sticky composer — buttons INSIDE textarea box ── */}
                <div
                  className={cn(
                    "shrink-0 border-t p-3 sm:p-4",
                    t.divider,
                    t.modalBg,
                  )}
                >
                  {isTicketClosed && (
                    <div
                      className={cn(
                        "mb-2.5 rounded-xl border px-3 py-2 text-xs font-semibold",
                        isDark
                          ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                          : "border-amber-500/20 bg-amber-50 text-amber-700",
                      )}
                    >
                      {closedTicketMessage}
                    </div>
                  )}

                  {/* Uploaded files row */}
                  {uploadedAttachments.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap gap-1.5">
                      {uploadedAttachments.map((file) => (
                        <span
                          key={file.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]",
                            t.borderSubtle,
                            t.inputBg,
                            t.textMuted,
                          )}
                        >
                          <FaFile className="h-2.5 w-2.5 shrink-0" />
                          <span className="max-w-[80px] truncate">
                            {file.filename}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setUploadedAttachments((p) =>
                                p.filter((i) => i.id !== file.id),
                              )
                            }
                            className={cn(
                              "rounded p-0.5 transition-colors",
                              isDark
                                ? "text-red-400/60 hover:text-red-400"
                                : "text-red-500/60 hover:text-red-500",
                            )}
                          >
                            <FaXmark className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Composer box: textarea with buttons at bottom-right inside */}
                  <div
                    className={cn(
                      "relative rounded-xl border transition-all duration-200",
                      t.borderInput,
                      t.inputBg,
                      "focus-within:ring-1",
                      isDark
                        ? "focus-within:border-[#c8a84b]/40 focus-within:ring-[#c8a84b]/20"
                        : "focus-within:border-[#8a7030]/40 focus-within:ring-[#8a7030]/20",
                    )}
                  >
                    <textarea
                      ref={textareaRef}
                      value={form.replyMessage}
                      disabled={isTicketClosed || saving}
                      onChange={(e) =>
                        setForm((p) =>
                          p ? { ...p, replyMessage: e.target.value } : p,
                        )
                      }
                      rows={3}
                      placeholder={
                        isTicketClosed
                          ? "این تیکت بسته شده است."
                          : "پاسخ خود را بنویسید..."
                      }
                      className={cn(
                        "block w-full resize-none border-0 bg-transparent px-3.5 pt-3 pb-12 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60",
                        t.textPrimary,
                        isDark
                          ? "placeholder:text-[#47443e]"
                          : "placeholder:text-[#b0aa9e]",
                      )}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          if (isTicketClosed) return;
                          void saveTicket();
                        }
                      }}
                    />

                    {/* Buttons bar pinned at bottom of textarea box */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 py-2">
                      {/* Left side: attach + hint */}
                      <div className="flex items-center gap-2">
                        <label
                          className={cn(
                            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-200",
                            t.textDisabled,
                            isDark
                              ? "hover:bg-[#1e1d1b] hover:text-blue-400"
                              : "hover:bg-[#f0ece4] hover:text-blue-600",
                            uploadingAttachment && "animate-pulse",
                            isTicketClosed &&
                              "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-current",
                          )}
                          title={
                            isTicketClosed
                              ? "این تیکت بسته شده است."
                              : "پیوست فایل"
                          }
                        >
                          <FaPaperclip className="h-3.5 w-3.5" />
                          <input
                            type="file"
                            className="hidden"
                            disabled={
                              isTicketClosed || uploadingAttachment || saving
                            }
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              void uploadTicketAttachment(f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {uploadingAttachment && (
                          <span className={cn("text-[11px]", t.textDisabled)}>
                            آپلود...
                          </span>
                        )}
                        <span
                          className={cn(
                            "hidden text-[11px] sm:inline",
                            t.textDisabled,
                          )}
                        >
                          {isTicketClosed ? "تیکت بسته است" : "Ctrl+Enter ارسال"}
                        </span>
                      </div>

                      {/* Right side: send button */}
                      <button
                        type="button"
                        onClick={saveTicket}
                        disabled={saving || isTicketClosed}
                        className={cn(
                          "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all duration-200",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          isDark
                            ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
                            : "bg-[#8a7030] text-white hover:bg-[#7a6428]",
                        )}
                      >
                        {saving ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                        ) : (
                          <FaPaperPlane className="h-3 w-3" />
                        )}
                        <span className="hidden sm:inline">
                          {saving ? "ارسال..." : "ارسال"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Settings / Info sidebar ── */}
              <aside
                className={cn(
                  "flex shrink-0 flex-col overflow-hidden",
                  "border-r",
                  t.divider,
                  activeTab !== "settings" && "hidden lg:flex",
                  "w-full lg:w-80 xl:w-[22rem]",
                )}
              >
                <div
                  className={cn(
                    "flex-1 space-y-4 overflow-y-auto p-4 sm:p-5",
                    t.scrollbarWide,
                  )}
                >
                  {isSuperAdmin && (
                    <>
                      <div>
                        <label className={fieldLabel}>موضوع</label>
                        <input
                          value={form.title}
                          onChange={(e) =>
                            setForm((p) =>
                              p ? { ...p, title: e.target.value } : p,
                            )
                          }
                          className={fieldInput}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>توضیحات</label>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm((p) =>
                              p ? { ...p, description: e.target.value } : p,
                            )
                          }
                          rows={3}
                          className={cn(fieldInput, "resize-none")}
                        />
                      </div>
                    </>
                  )}

                  <CustomSelect
                    label="وضعیت"
                    options={statusOptions}
                    value={form.status}
                    disabled={!isSuperAdmin || saving}
                    onChange={(v) =>
                      setForm((p) =>
                        p ? { ...p, status: String(v) as TicketStatus } : p,
                      )
                    }
                  />

                  <CustomSelect
                    label="اولویت"
                    options={priorityOptions}
                    value={form.priority}
                    disabled={!isSuperAdmin || saving}
                    onChange={(v) =>
                      setForm((p) =>
                        p ? { ...p, priority: String(v) as TicketPriority } : p,
                      )
                    }
                  />

                  <CustomSelect
                    label="درخواست‌دهنده"
                    options={requesterOptions}
                    value={form.requesterId}
                    disabled
                    helperText="فقط خواندنی"
                    searchable
                    onChange={(v) =>
                      setForm((p) => (p ? { ...p, requesterId: String(v) } : p))
                    }
                  />

                  <CustomSelect
                    label="مسئول رسیدگی"
                    options={assigneeOptions}
                    value={form.assigneeId}
                    disabled={!isSuperAdmin || saving}
                    searchable
                    clearable
                    onChange={(v) =>
                      setForm((p) => (p ? { ...p, assigneeId: String(v) } : p))
                    }
                  />

                  {/* Meta info */}
                  <div
                    className={cn(
                      "rounded-xl border p-3.5",
                      t.borderSubtle,
                      t.inputBg,
                    )}
                  >
                    <h4
                      className={cn(
                        "mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
                        t.textDisabled,
                      )}
                    >
                      <FaCircleInfo className="h-3 w-3" />
                      اطلاعات تیکت
                    </h4>
                    <div className="space-y-2.5">
                      {(
                        [
                          ["شناسه", selectedTicket._id],
                          ["تاریخ ثبت", formatFaDate(selectedTicket.createdAt)],
                          [
                            "آخرین بروزرسانی",
                            formatFaDate(selectedTicket.updatedAt),
                          ],
                          [
                            "آخرین پاسخ",
                            formatFaDate(selectedTicket.lastReplyAt),
                          ],
                          ["تعداد پاسخ‌ها", String(selectedTicket.replyCount)],
                        ] as const
                      ).map(([label, val]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-2"
                        >
                          <span
                            className={cn("shrink-0 text-xs", t.textDisabled)}
                          >
                            {label}
                          </span>
                          <span
                            className={cn(
                              "text-left text-xs font-medium break-all",
                              t.textMuted,
                            )}
                            dir="ltr"
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={saveTicket}
                      disabled={saving}
                      className={cn(primaryBtn, "w-full")}
                    >
                      {saving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <FaPaperPlane className="h-4 w-4" />
                      )}
                      {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>
                  )}
                </div>
              </aside>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
