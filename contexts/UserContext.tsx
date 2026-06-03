// ─────────────────────────────────────────────────────────────────
// contexts/UserContext.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import useSWR from "swr";
import { toast } from "@/components/ui/CustomToast";
import { userService } from "@/services/userService";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserStats,
  UserStatus,
  UserContextValue,
  UserProviderProps,
} from "@/types/index";

/* ══════════════════════════════════════════════
   Context Types
   ══════════════════════════════════════════════ */

const defaultStats: UserStats = {
  total: 0,
  active: 0,
  inactive: 0,
  blocked: 0,
  pending: 0,
  agents: 0,
  admins: 0,
};

/* ══════════════════════════════════════════════
   Context
   ══════════════════════════════════════════════ */

const UserContext = createContext<UserContextValue | null>(null);

/* ══════════════════════════════════════════════
   Provider
   ══════════════════════════════════════════════ */

export function UserProvider({
  children,
  initialUsers,
  initialStats,
}: UserProviderProps) {
  // ── SWR: Users ──
  const {
    data: users = [],
    error: usersError,
    isLoading: usersLoading,
    isValidating: usersValidating,
    mutate: mutateUsers,
  } = useSWR<User[]>(
    "/api/users",
    async () => {
      const res = await userService.getAll();
      return res.data;
    },
    {
      fallbackData: initialUsers,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    },
  );

  // ── SWR: Stats ──
  const { data: stats = defaultStats, mutate: mutateStats } = useSWR<UserStats>(
    "/api/users/stats",
    () => userService.getStats(),
    {
      fallbackData: initialStats ?? defaultStats,
      revalidateOnFocus: false,
      dedupingInterval: 15000,
    },
  );

  // ── Helper: refresh both ──
  const refreshAll = useCallback(async () => {
    await Promise.all([mutateUsers(), mutateStats()]);
  }, [mutateUsers, mutateStats]);

  /* ──────────────────────────────────────────
     CREATE
     ────────────────────────────────────────── */
  const createUser = useCallback(
    async (payload: CreateUserPayload): Promise<User | void> => {
      const loadingId = toast.loading("در حال ایجاد کاربر...", {
        title: "ایجاد کاربر",
      });

      try {
        const created = await userService.create(payload);

        // Optimistic update
        await mutateUsers(
          (current) => (current ? [created, ...current] : [created]),
          { revalidate: true },
        );
        await mutateStats();

        const name =
          [payload.firstName, payload.lastName].filter(Boolean).join(" ") ||
          payload.phoneNumber;

        toast.update(loadingId, {
          type: "success",
          title: "کاربر ایجاد شد",
          message: `«${name}» با موفقیت اضافه شد.`,
          duration: 4000,
        });

        return created;
      } catch (err) {
        toast.update(loadingId, {
          type: "error",
          title: "خطا در ایجاد",
          message:
            err instanceof Error ? err.message : "ایجاد کاربر با خطا مواجه شد.",
          action: {
            label: "تلاش مجدد",
            onClick: () => createUser(payload),
          },
          duration: 8000,
        });
        throw err;
      }
    },
    [mutateUsers, mutateStats],
  );

  /* ──────────────────────────────────────────
     UPDATE
     ────────────────────────────────────────── */
  const updateUser = useCallback(
    async (payload: UpdateUserPayload): Promise<User | void> => {
      const loadingId = toast.loading("در حال ذخیره تغییرات...", {
        title: "ویرایش کاربر",
      });

      try {
        const updated = await userService.update(payload);

        await mutateUsers(
          (current) =>
            current?.map((u) =>
              u.id === payload.id ? { ...u, ...updated } : u,
            ),
          { revalidate: true },
        );
        await mutateStats();

        const name =
          [payload.firstName, payload.lastName].filter(Boolean).join(" ") ||
          "کاربر";

        toast.update(loadingId, {
          type: "success",
          title: "تغییرات ذخیره شد",
          message: `اطلاعات «${name}» بروزرسانی شد.`,
          duration: 4000,
        });

        return updated;
      } catch (err) {
        toast.update(loadingId, {
          type: "error",
          title: "خطا در ویرایش",
          message:
            err instanceof Error
              ? err.message
              : "ذخیره تغییرات با خطا مواجه شد.",
          action: {
            label: "تلاش مجدد",
            onClick: () => updateUser(payload),
          },
          duration: 8000,
        });
        throw err;
      }
    },
    [mutateUsers, mutateStats],
  );

  /* ──────────────────────────────────────────
     DELETE (with undo)
     ────────────────────────────────────────── */
  const deleteUser = useCallback(
    async (user: User): Promise<void> => {
      const loadingId = toast.loading(
        `در حال حذف «${user.fullName || user.phoneNumber}»...`,
        { title: "حذف کاربر" },
      );

      const previousUsers = users ? [...users] : [];

      try {
        // Optimistic remove
        await mutateUsers(
          (current) => current?.filter((u) => u.id !== user.id),
          { revalidate: false },
        );

        await userService.delete(user.id);
        await mutateStats();

        toast.update(loadingId, {
          type: "success",
          title: "کاربر حذف شد",
          message: `«${user.fullName || user.phoneNumber}» حذف شد.`,
          duration: 8000,
          action: {
            label: "بازگردانی",
            onClick: async () => {
              // Undo: re-create (or restore if API supports)
              try {
                await userService.create({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phoneNumber: user.phoneNumber,
                  email: user.email,
                  nationalCode: user.nationalCode,
                  fatherName: user.fatherName,
                  role: user.role,
                  status: user.status,
                  limits: user.limits,
                });
                await refreshAll();
                toast.success("بازگردانی موفق", {
                  title: "بازگردانی",
                  duration: 3000,
                });
              } catch {
                // Fallback: just rollback cache
                await mutateUsers(previousUsers, { revalidate: true });
                toast.success("بازگردانی از حافظه انجام شد.", {
                  title: "بازگردانی",
                  duration: 3000,
                });
              }
            },
          },
        });
      } catch (err) {
        // Rollback
        await mutateUsers(previousUsers, { revalidate: true });

        toast.update(loadingId, {
          type: "error",
          title: "خطا در حذف",
          message:
            err instanceof Error ? err.message : "حذف کاربر با خطا مواجه شد.",
          action: {
            label: "تلاش مجدد",
            onClick: () => deleteUser(user),
          },
          duration: 8000,
        });
        throw err;
      }
    },
    [users, mutateUsers, mutateStats, refreshAll],
  );

  /* ──────────────────────────────────────────
     TOGGLE STATUS
     ────────────────────────────────────────── */
  const toggleUserStatus = useCallback(
    async (user: User, newStatus: UserStatus): Promise<void> => {
      const statusLabels: Record<UserStatus, string> = {
        active: "فعال",
        inactive: "غیرفعال",
        blocked: "مسدود",
        pending: "در انتظار",
      };

      const loadingId = toast.loading(
        `تغییر وضعیت به «${statusLabels[newStatus]}»...`,
        { title: "تغییر وضعیت" },
      );

      const previousStatus = user.status;

      try {
        // Optimistic
        await mutateUsers(
          (current) =>
            current?.map((u) =>
              u.id === user.id ? { ...u, status: newStatus } : u,
            ),
          { revalidate: false },
        );

        await userService.toggleStatus({ id: user.id, status: newStatus });
        await mutateStats();

        toast.update(loadingId, {
          type: "success",
          title: "وضعیت تغییر کرد",
          message: `«${user.fullName || user.phoneNumber}» ${statusLabels[newStatus]} شد.`,
          duration: 4000,
        });
      } catch (err) {
        // Rollback
        await mutateUsers(
          (current) =>
            current?.map((u) =>
              u.id === user.id ? { ...u, status: previousStatus } : u,
            ),
          { revalidate: true },
        );

        toast.update(loadingId, {
          type: "error",
          title: "خطا در تغییر وضعیت",
          message:
            err instanceof Error ? err.message : "عملیات با خطا مواجه شد.",
          duration: 6000,
        });
        throw err;
      }
    },
    [mutateUsers, mutateStats],
  );

  /* ──────────────────────────────────────────
     TOGGLE BLOCK
     ────────────────────────────────────────── */
  const toggleUserBlock = useCallback(
    async (user: User): Promise<void> => {
      const isBlocked = user.status === "blocked";
      const newStatus: UserStatus = isBlocked ? "active" : "blocked";
      await toggleUserStatus(user, newStatus);
    },
    [toggleUserStatus],
  );

  /* ──────────────────────────────────────────
     RESET PASSWORD
     ────────────────────────────────────────── */
  const resetUserPassword = useCallback(async (user: User): Promise<void> => {
    const loadingId = toast.loading("در حال ریست رمز عبور...", {
      title: "ریست رمز عبور",
    });

    try {
      const result = await userService.resetPassword(user.id);

      toast.update(loadingId, {
        type: "success",
        title: "رمز عبور ریست شد",
        message:
          result.message ||
          `رمز عبور «${user.fullName || user.phoneNumber}» ریست شد.`,
        duration: 5000,
      });
    } catch (err) {
      toast.update(loadingId, {
        type: "error",
        title: "خطا در ریست رمز عبور",
        message: err instanceof Error ? err.message : "عملیات با خطا مواجه شد.",
        action: {
          label: "تلاش مجدد",
          onClick: () => resetUserPassword(user),
        },
        duration: 8000,
      });
      throw err;
    }
  }, []);

  /* ──────────────────────────────────────────
     VERIFY PHONE
     ────────────────────────────────────────── */
  const verifyUserPhone = useCallback(
    async (user: User): Promise<void> => {
      const loadingId = toast.loading("در حال تأیید شماره...", {
        title: "تأیید شماره",
      });

      try {
        await userService.verifyPhone(user.id);

        await mutateUsers(
          (current) =>
            current?.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    isPhoneVerified: true,
                    phoneVerifiedAt: new Date().toISOString(),
                  }
                : u,
            ),
          { revalidate: true },
        );

        toast.update(loadingId, {
          type: "success",
          title: "شماره تأیید شد",
          message: `شماره «${user.phoneNumber}» تأیید شد.`,
          duration: 4000,
        });
      } catch (err) {
        toast.update(loadingId, {
          type: "error",
          title: "خطا در تأیید شماره",
          message:
            err instanceof Error ? err.message : "عملیات با خطا مواجه شد.",
          duration: 6000,
        });
        throw err;
      }
    },
    [mutateUsers],
  );

  /* ──────────────────────────────────────────
     BULK DELETE
     ────────────────────────────────────────── */
  const deleteBulk = useCallback(
    async (ids: string[]): Promise<void> => {
      const loadingId = toast.loading(`حذف ${ids.length} کاربر...`, {
        title: "حذف گروهی",
      });

      const previousUsers = users ? [...users] : [];

      try {
        await mutateUsers(
          (current) => current?.filter((u) => !ids.includes(u.id)),
          { revalidate: false },
        );

        const result = await userService.deleteBulk(ids);
        await mutateStats();

        toast.update(loadingId, {
          type: "success",
          title: "حذف گروهی انجام شد",
          message: `${result.deleted} کاربر حذف شدند.`,
          duration: 5000,
        });
      } catch (err) {
        await mutateUsers(previousUsers, { revalidate: true });

        toast.update(loadingId, {
          type: "error",
          title: "خطا در حذف گروهی",
          message:
            err instanceof Error ? err.message : "عملیات با خطا مواجه شد.",
          duration: 8000,
        });
        throw err;
      }
    },
    [users, mutateUsers, mutateStats],
  );

  /* ──────────────────────────────────────────
     Context Value
     ────────────────────────────────────────── */
  const value = useMemo<UserContextValue>(
    () => ({
      users,
      stats,
      isLoading: usersLoading,
      isValidating: usersValidating,
      error: usersError,

      createUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      toggleUserBlock,
      resetUserPassword,
      verifyUserPhone,
      deleteBulk,

      refreshUsers: async () => {
        await mutateUsers();
      },
      refreshStats: async () => {
        await mutateStats();
      },
      mutateUsers,
    }),
    [
      users,
      stats,
      usersLoading,
      usersValidating,
      usersError,
      createUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      toggleUserBlock,
      resetUserPassword,
      verifyUserPhone,
      deleteBulk,
      mutateUsers,
      mutateStats,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/* ══════════════════════════════════════════════
   Hook
   ══════════════════════════════════════════════ */

export function useUsers(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used inside <UserProvider>");
  }
  return context;
}
