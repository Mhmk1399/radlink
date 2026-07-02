import type { IconType } from "react-icons";
import {
  FaBell,
  FaBolt,
  FaCalendarDays,
  FaCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaClock,
  FaCreditCard,
  FaFileLines,
  FaGift,
  FaGlobe,
  FaHeart,
  FaLock,
  FaMessage,
  FaScrewdriverWrench,
  FaShieldHalved,
  FaStar,
  FaTriangleExclamation,
  FaUser,
  FaBullhorn,
} from "react-icons/fa6";
import {
  resolveNotificationIconKey,
  type NotificationIconKey,
} from "@/lib/notifications/notificationIcons";

const ICONS: Record<NotificationIconKey, IconType> = {
  info: FaCircleInfo,
  warning: FaTriangleExclamation,
  success: FaCheck,
  error: FaCircleExclamation,
  bell: FaBell,
  megaphone: FaBullhorn,
  message: FaMessage,
  calendar: FaCalendarDays,
  clock: FaClock,
  gift: FaGift,
  star: FaStar,
  heart: FaHeart,
  shield: FaShieldHalved,
  lock: FaLock,
  tools: FaScrewdriverWrench,
  user: FaUser,
  payment: FaCreditCard,
  document: FaFileLines,
  globe: FaGlobe,
  bolt: FaBolt,
};

export function NotificationIcon({
  iconKey,
  type = "info",
  className,
}: {
  iconKey?: string;
  type?: "info" | "danger";
  className?: string;
}) {
  const Icon = ICONS[resolveNotificationIconKey(iconKey, type)];
  return <Icon aria-hidden="true" className={className} />;
}
