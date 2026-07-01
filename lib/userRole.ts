export function getUserRoleLabel(role?: string): string {
  const labels: Record<string, string> = {
    user: "کاربر",
    agent: "نماینده",
    admin: "مدیر",
    superAdmin: "R A D",
  };

  return labels[role ?? ""] ?? role ?? "کاربر";
}

export const superAdminBadgeClass =
  "border-[#D4AF37] bg-[#D4AF37] font-bold text-[#241a00] shadow-[0_3px_12px_rgba(212,175,55,0.24)]";
