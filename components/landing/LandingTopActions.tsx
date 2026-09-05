"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowUpFromBracket,
  FaFile,
  FaEllipsisVertical,
  FaMessage,
  FaPaperPlane,
  FaPaperclip,
  FaPenToSquare,
  FaUser,
  FaXmark,
} from "react-icons/fa6";
import { toast } from "@/components/ui/CustomToast";
import { uploadFile } from "@/lib/fileUtils";

type UserRef = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
};

type FileRef = {
  _id?: string;
  id?: string;
  filename?: string;
  path?: string;
  url?: string;
};

type TicketReply = {
  _id?: string;
  author?: UserRef | string;
  message: string;
  isStaff?: boolean;
  createdAt?: string;
  attachments: FileRef[];
};

type LandingChatTicket = {
  _id: string;
  title: string;
  description?: string;
  requester?: UserRef | string;
  requesterId: string;
  attachments: FileRef[];
  replies: TicketReply[];
  status?: "open" | "in_progress" | "closed";
};

type PendingAttachment = {
  id: string;
  filename: string;
  path: string;
};

type Props = {
  pageId: string;
  pageTitle: string;
  pageUrl: string;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getId(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const id = value._id ?? value.id;
  return id ? String(id) : "";
}

function getAuthToken() {
  return typeof window === "undefined"
    ? ""
    : window.localStorage.getItem("auth_token") ?? "";
}

function getReturnToWithChat() {
  const path = `${window.location.pathname}${window.location.search}`;
  const url = new URL(path, window.location.origin);
  url.searchParams.set("chat", "1");
  return `${url.pathname}${url.search}`;
}

function normalizeFile(value: unknown): FileRef | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  const filename = toText(value.filename) || "file";
  const path = toText(value.path) || toText(value.url);
  return { _id: id, id, filename, path, url: path };
}

function normalizeTicket(value: unknown): LandingChatTicket | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  if (!id) return null;

  const attachments = Array.isArray(value.attachments)
    ? value.attachments.map(normalizeFile).filter((file): file is FileRef => !!file)
    : [];
  const replies = Array.isArray(value.replies)
    ? value.replies.filter(isRecord).map((reply) => ({
        _id: getId(reply) || undefined,
        author: reply.author as UserRef | string | undefined,
        message: toText(reply.message),
        isStaff: reply.isStaff === true,
        createdAt: toText(reply.createdAt),
        attachments: Array.isArray(reply.attachments)
          ? reply.attachments
              .map(normalizeFile)
              .filter((file): file is FileRef => !!file)
          : [],
      }))
    : [];

  return {
    _id: id,
    title: toText(value.title),
    description: toText(value.description),
    requester: value.requester as UserRef | string | undefined,
    requesterId: getId(value.requester) || toText(value.requesterId),
    attachments,
    replies,
    status:
      value.status === "open" ||
      value.status === "in_progress" ||
      value.status === "closed"
        ? value.status
        : undefined,
  };
}

function userName(value: unknown) {
  if (!isRecord(value)) return "شما";
  const name = [value.firstName, value.lastName]
    .filter((item) => typeof item === "string" && item.trim())
    .join(" ")
    .trim();
  return name || toText(value.phoneNumber) || "شما";
}

function formatTime(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function LandingTopActions({ pageId, pageTitle, pageUrl }: Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [ticket, setTicket] = useState<LandingChatTicket | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => {
    if (!ticket) return [];
    const firstMessage =
      ticket.description || ticket.attachments.length > 0
        ? [
            {
              id: `${ticket._id}-first`,
              text: ticket.description ?? "",
              isStaff: false,
              author: ticket.requester,
              attachments: ticket.attachments,
              createdAt: "",
            },
          ]
        : [];

    return [
      ...firstMessage,
      ...ticket.replies.map((reply, index) => ({
        id: reply._id ?? `${reply.createdAt}-${index}`,
        text: reply.message,
        isStaff: reply.isStaff === true,
        author: reply.author,
        attachments: reply.attachments,
        createdAt: reply.createdAt ?? "",
      })),
    ];
  }, [ticket]);

  const redirectToAuth = useCallback(() => {
    const returnTo = getReturnToWithChat();
    toast.info("برای شروع گفت‌وگو وارد شوید؛ بعد از ورود مستقیم به همین صفحه برمی‌گردید.");
    window.location.href = `/auth?returnTo=${encodeURIComponent(returnTo)}`;
  }, []);

  const loadChat = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      redirectToAuth();
      return;
    }

    setLoadingChat(true);
    try {
      const response = await fetch(
        `/api/tickets?mode=landing-chat&pageId=${encodeURIComponent(pageId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const json = await response.json().catch(() => null);
      if (response.status === 401) {
        redirectToAuth();
        return;
      }
      if (!response.ok) {
        throw new Error(json?.message ?? "دریافت گفت‌وگو انجام نشد.");
      }
      setTicket(normalizeTicket(json?.ticket));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "دریافت گفت‌وگو انجام نشد.",
      );
    } finally {
      setLoadingChat(false);
    }
  }, [pageId, redirectToAuth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("chat") !== "1") return;

    if (!getAuthToken()) {
      redirectToAuth();
      return;
    }

    params.delete("chat");
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
    const timer = window.setTimeout(() => setChatOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [redirectToAuth]);

  useEffect(() => {
    if (!chatOpen) return;
    const timer = window.setTimeout(() => {
      void loadChat();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [chatOpen, loadChat]);

  useEffect(() => {
    if (!chatOpen) return;
    const timer = window.setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [chatOpen, messages.length, pendingFiles.length]);

  useEffect(() => {
    if (!chatOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [chatOpen]);

  useEffect(() => {
    if (!actionMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setActionMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActionMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionMenuOpen]);

  function handleEditClick() {
    setActionMenuOpen(false);
    if (!getAuthToken()) {
      toast.error("برای ویرایش این صفحه ابتدا وارد حساب شوید.");
      return;
    }
    window.location.href = `/builder/${encodeURIComponent(pageId)}`;
  }

  function handleChatClick() {
    setActionMenuOpen(false);
    if (!getAuthToken()) {
      redirectToAuth();
      return;
    }
    setChatOpen(true);
  }

  async function handleFileChange(file: File | null | undefined) {
    if (!file) return;
    try {
      setUploading(true);
      const uploaded = await uploadFile(file, { kind: "ticket" });
      setPendingFiles((current) => [
        ...current,
        {
          id: uploaded.fileId,
          filename: uploaded.originalName || uploaded.file.filename,
          path: uploaded.url,
        },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "آپلود فایل انجام نشد.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function sendMessage() {
    if (loadingChat) return;
    const text = message.trim();
    if (!text && pendingFiles.length === 0) {
      toast.warning("پیام یا فایل را وارد کنید.");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      redirectToAuth();
      return;
    }

    setSending(true);
    try {
      const isFirstMessage = !ticket;
      const response = await fetch(
        isFirstMessage ? "/api/tickets" : `/api/tickets/${ticket._id}`,
        {
          method: isFirstMessage ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            isFirstMessage
              ? {
                  source: "landing",
                  pageId,
                  message: text,
                  attachments: pendingFiles.map((file) => file.id),
                }
              : {
                  replyMessage: text,
                  replyAttachments: pendingFiles.map((file) => file.id),
                },
          ),
        },
      );
      const json = await response.json().catch(() => null);
      if (response.status === 401) {
        redirectToAuth();
        return;
      }
      if (!response.ok) {
        throw new Error(json?.message ?? "ارسال پیام انجام نشد.");
      }

      const nextTicket = normalizeTicket(json?.ticket);
      if (nextTicket) setTicket(nextTicket);
      setMessage("");
      setPendingFiles([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ارسال پیام انجام نشد.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div
        ref={actionsRef}
        dir="ltr"
        className="fixed left-3 top-3 z-40 sm:left-5 sm:top-5"
      >
        <button
          type="button"
          onClick={() => setActionMenuOpen((current) => !current)}
          aria-expanded={actionMenuOpen}
          aria-label="گزینه‌های صفحه"
          title="گزینه‌های صفحه"
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-black/45 text-white shadow-lg shadow-black/15 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/75"
        >
          <FaEllipsisVertical className="h-4 w-4 transition group-hover:scale-105" />
        </button>
        {actionMenuOpen ? (
          <div className="absolute left-0 top-[3.25rem] w-48 overflow-hidden rounded-2xl border border-white/18 bg-[#111111]/95 p-1.5 text-right text-white shadow-2xl shadow-black/25 backdrop-blur-xl">
            <button
              type="button"
              onClick={handleChatClick}
              className="flex w-full items-center justify-end gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition hover:bg-[#c8a84b]/15 hover:text-[#f4d56d] focus:outline-none focus:ring-2 focus:ring-[#c8a84b]/40"
            >
              <span>گفت‌وگو با صاحب سایت</span>
              <FaMessage className="h-3.5 w-3.5 shrink-0" />
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              className="flex w-full items-center justify-end gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <span>ویرایش صفحه</span>
              <FaUser className="h-3.5 w-3.5 shrink-0" />
            </button>
          </div>
        ) : null}
      </div>

      {chatOpen ? (
        <div
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="landing-chat-title"
          className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <section className="flex h-dvh w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-[#0b0b0c] text-white shadow-2xl sm:h-[680px] sm:max-w-lg sm:rounded-3xl sm:border sm:border-white/18">
            <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#151516]/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-lg shadow-black/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c8a84b] text-[#171106] shadow-md shadow-[#c8a84b]/20">
                <FaMessage className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="landing-chat-title" className="truncate text-base font-bold sm:text-sm">
                  گفت‌وگو با صاحب سایت
                </h2>
                <p className="truncate text-xs text-white/48">
                  {pageTitle || pageUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="بستن گفت‌وگو"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/6 text-white/65 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#c8a84b]/70"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#1b1710_0%,#0d0d0d_38%,#090909_100%)] px-3 py-4 sm:px-4">
              {loadingChat ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c8a84b] border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 text-[#c8a84b]">
                    <FaPenToSquare className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-white">شروع گفت‌وگو</p>
                  <p className="mt-2 text-xs leading-6 text-white/52">
                    پیام خودتان را بنویسید یا فایل بفرستید تا صاحب سایت در داشبورد پاسخ بدهد.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((item) => (
                    <article
                      key={item.id}
                      className={cn(
                        "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[84%]",
                        item.isStaff
                          ? "mr-auto rounded-bl-md bg-[#c8a84b] text-[#15110a]"
                          : "ml-auto rounded-br-md bg-white/10 text-white",
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2 text-[11px] opacity-70">
                        <span>{item.isStaff ? "صاحب سایت" : userName(item.author)}</span>
                        {item.createdAt ? <span>{formatTime(item.createdAt)}</span> : null}
                      </div>
                      {item.text ? (
                        <p className="whitespace-pre-wrap leading-7">{item.text}</p>
                      ) : null}
                      {item.attachments.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.attachments.map((file) => (
                            <a
                              key={file._id ?? file.id ?? file.path}
                              href={file.path || file.url}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition",
                                item.isStaff
                                  ? "border-black/15 bg-black/10 hover:bg-black/15"
                                  : "border-white/10 bg-white/8 hover:bg-white/12",
                              )}
                            >
                              <FaFile className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {file.filename || "file"}
                              </span>
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-white/10 bg-[#151516]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-18px_40px_-28px_rgba(0,0,0,0.85)]">
              {pendingFiles.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {pendingFiles.map((file) => (
                    <span
                      key={file.id}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/10 bg-white/8 px-2 py-1 text-[11px] text-white/75"
                    >
                      <FaFile className="h-3 w-3 shrink-0" />
                      <span className="truncate">{file.filename}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((current) =>
                            current.filter((item) => item.id !== file.id),
                          )
                        }
                        aria-label="حذف فایل"
                        className="rounded p-0.5 text-white/45 transition hover:bg-white/10 hover:text-white"
                      >
                        <FaXmark className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="flex items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.07] p-2 focus-within:border-[#c8a84b]/60">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending || loadingChat}
                  aria-label="پیوست فایل"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/62 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <FaPaperclip className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => void handleFileChange(event.target.files?.[0])}
                />
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  placeholder="پیام خود را بنویسید..."
                  className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm leading-7 text-white outline-none placeholder:text-white/35 disabled:opacity-60"
                  disabled={sending || loadingChat}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={sending || uploading || loadingChat}
                  aria-label="ارسال پیام"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c8a84b] text-[#15110a] transition hover:bg-[#d9bc62] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {sending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <FaPaperPlane className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
                <span>Ctrl + Enter برای ارسال</span>
                <span className="inline-flex items-center gap-1">
                  <FaArrowUpFromBracket className="h-3 w-3" />
                  فایل پیوست
                </span>
              </div>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
