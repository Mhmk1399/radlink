


// ─────────────────────────────────────────────────────────────────
// types/index.ts
// ─────────────────────────────────────────────────────────────────
//
// All frontend types derived from Mongoose models.
// Use these throughout the app — never import from models directly.
//
// ─────────────────────────────────────────────────────────────────

import { ReactNode } from "react";
import { KeyedMutator } from "swr/_internal";

/* ══════════════════════════════════════════════
   SHARED / COMMON
   ══════════════════════════════════════════════ */

/** Base fields that every document has after Mongoose toJSON transform */
export interface BaseDocument {
    id: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

/** Pagination wrapper returned by list endpoints */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/** Common list query filters */
export interface ListFilters {
    search?: string;
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDir?: "asc" | "desc";
}


// ══════════════════════════════════════════════ CONTEXT USER
export interface UserContextValue {
    // ── Data ──
    users: User[];
    stats: UserStats;
    isLoading: boolean;
    isValidating: boolean;
    error: Error | undefined;

    // ── Mutations ──
    createUser: (payload: CreateUserPayload) => Promise<User | void>;
    updateUser: (payload: UpdateUserPayload) => Promise<User | void>;
    deleteUser: (user: User) => Promise<void>;
    toggleUserStatus: (user: User, newStatus: UserStatus) => Promise<void>;
    toggleUserBlock: (user: User) => Promise<void>;
    resetUserPassword: (user: User) => Promise<void>;
    verifyUserPhone: (user: User) => Promise<void>;
    deleteBulk: (ids: string[]) => Promise<void>;

    // ── Revalidation ──
    refreshUsers: () => Promise<void>;
    refreshStats: () => Promise<void>;
    mutateUsers: KeyedMutator<User[]>;
}


export interface UserProviderProps {
    children: ReactNode;
    /** Optional initial data for SSR */
    initialUsers?: User[];
    /** Optional initial stats */
    initialStats?: UserStats;
}

/* ══════════════════════════════════════════════
   USER
   ══════════════════════════════════════════════ */

export type UserRole = "user" | "agent" | "admin" | "superAdmin";
export type UserStatus = "active" | "inactive" | "blocked" | "pending";

export interface UserLimits {
    files: number;
    blocks: number;
    pages: number;
}

export type AgentLimits = UserLimits;

export interface User extends BaseDocument {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phoneNumber: string;
    email?: string;
    avatarUrl?: string;
    nationalCode?: string;
    fatherName?: string;
    role: UserRole;
    status: UserStatus;
    permissions: string[];
    limits: AgentLimits;
    agentId?: string;
    agent?: Agent;
    lastLoginAt?: string;
    lastOtpRequestAt?: string;
    phoneVerifiedAt?: string;
    isPhoneVerified: boolean;
    isDeleted: boolean;
    createdBy?: string;
    updatedBy?: string;
}

export interface CreateUserPayload {
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
    email?: string;
    nationalCode?: string;
    fatherName?: string;
    role?: UserRole;
    status?: UserStatus;
    limits?: Partial<AgentLimits>;
    agentId?: string;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
    id: string;
    avatarUrl?: string;
    isPhoneVerified?: boolean;
}

export interface ToggleUserStatusPayload {
    id: string;
    status: UserStatus;
}

export interface UserFilters extends ListFilters {
    role?: UserRole;
    status?: UserStatus;
    isPhoneVerified?: boolean;
    isDeleted?: boolean;
}

export interface UserStats {
    total: number;
    active: number;
    inactive: number;
    blocked: number;
    pending: number;
    agents: number;
    admins: number;
}

export type PaginatedUsersResponse = PaginatedResponse<User> & {
    stats?: UserStats;
};

/* ══════════════════════════════════════════════
   AGENT
   ══════════════════════════════════════════════ */

export type AgentType = "personal" | "company";

export interface Agent extends BaseDocument {
    userId: string;
    user?: User;
    type: AgentType;
    postalCode?: string;
    fixedNumber?: string;
    pricePerLanding: number;
    companyName?: string;
    ceoName?: string;
    economicNumber?: string;
    registrationNumber?: string;
    limits: UserLimits;
    isActive: boolean;
}

export interface CreateAgentPayload {
    userId: string;
    type: AgentType;
    postalCode?: string;
    fixedNumber?: string;
    pricePerLanding?: number;
    companyName?: string;
    ceoName?: string;
    economicNumber?: string;
    registrationNumber?: string;
    limits?: Partial<UserLimits>;
}

export interface UpdateAgentPayload extends Partial<Omit<CreateAgentPayload, "userId">> {
    id: string;
    isActive?: boolean;
}

export interface AgentFilters extends ListFilters {
    type?: AgentType;
    isActive?: boolean;
}

export interface AgentStats {
    total: number;
    personal: number;
    company: number;
    active: number;
    inactive: number;
}

export type PaginatedAgentsResponse = PaginatedResponse<Agent> & {
    stats?: AgentStats;
};

/* ══════════════════════════════════════════════
   ACCESS
   ══════════════════════════════════════════════ */

export type AccessAction = "view" | "create" | "update" | "delete" | "publish";

export interface StaticComponentAccess {
    componentName: string;
    actions: AccessAction[];
}

export interface DynamicResourceAccess {
    resourceId: string;
    actions: AccessAction[];
}

export interface DynamicAccess {
    templates: DynamicResourceAccess[];
    blocks: DynamicResourceAccess[];
    pages: DynamicResourceAccess[];
}

export interface Access extends BaseDocument {
    staticComponents: StaticComponentAccess[];
    dynamicAccess: DynamicAccess;
    isActive: boolean;
}

export interface CreateAccessPayload {
    staticComponents?: StaticComponentAccess[];
    dynamicAccess?: Partial<DynamicAccess>;
}

export interface UpdateAccessPayload extends Partial<CreateAccessPayload> {
    id: string;
    isActive?: boolean;
}

export type PaginatedAccessResponse = PaginatedResponse<Access>;

/* ══════════════════════════════════════════════
   PERMISSION
   ══════════════════════════════════════════════ */

export interface Permission extends BaseDocument {
    name: string;
    description?: string;
    accesses: string[];
    accessDetails?: Access[];
    assignedToUsers: string[];
    assignedUsers?: User[];
    grantedBy?: string;
    grantedByUser?: User;
    isActive: boolean;
}

export interface CreatePermissionPayload {
    name: string;
    description?: string;
    accesses: string[];
    assignedToUsers: string[];
    grantedBy?: string;
}

export interface UpdatePermissionPayload extends Partial<CreatePermissionPayload> {
    id: string;
    isActive?: boolean;
}

export interface PermissionFilters extends ListFilters {
    isActive?: boolean;
    grantedBy?: string;
}

export interface PermissionStats {
    total: number;
    active: number;
    inactive: number;
}

export type PaginatedPermissionsResponse = PaginatedResponse<Permission> & {
    stats?: PermissionStats;
};

/* ══════════════════════════════════════════════
   BLOCK
   ══════════════════════════════════════════════ */

export interface BlockStats {
    [key: string]: unknown;
}

export interface BlockStyle {
    [key: string]: unknown;
}

export interface BlockData {
    [key: string]: unknown;
}

export interface Block extends BaseDocument {
    name: string;
    type: string;
    jason: Record<string, unknown>;
    icon: string;
    isActive: boolean;
    style: BlockStyle;
    stats: BlockStats;
    data: BlockData;
}

export interface CreateBlockPayload {
    name: string;
    type: string;
    jason: Record<string, unknown>;
    icon: string;
    isActive?: boolean;
    style: BlockStyle;
    stats?: BlockStats;
    data: BlockData;
}

export interface UpdateBlockPayload extends Partial<CreateBlockPayload> {
    id: string;
}

export interface BlockFilters extends ListFilters {
    type?: string;
    isActive?: boolean;
}

export interface BlockSummaryStats {
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
}

export type PaginatedBlocksResponse = PaginatedResponse<Block> & {
    stats?: BlockSummaryStats;
};

/* ══════════════════════════════════════════════
   TEMPLATE
   ══════════════════════════════════════════════ */

export interface TemplateColors {
    primary?: string;
    secondary?: string;
    textColors?: string;
}

export interface Template extends BaseDocument {
    name: string;
    description?: string;
    font?: string;
    colors: TemplateColors;
    bgImage?: string;
    btnSettings?: Record<string, unknown>;
    cardSettings?: Record<string, unknown>;
    categoryId?: string;
    category?: Category;
    blockIds: string[];
    blocks?: Block[];
}

export interface CreateTemplatePayload {
    name: string;
    description?: string;
    font?: string;
    colors?: TemplateColors;
    bgImage?: string;
    btnSettings?: Record<string, unknown>;
    cardSettings?: Record<string, unknown>;
    categoryId?: string;
    blockIds?: string[];
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {
    id: string;
}

export interface TemplateFilters extends ListFilters {
    categoryId?: string;
}

export interface TemplateStats {
    total: number;
    byCategory: Record<string, number>;
}

export type PaginatedTemplatesResponse = PaginatedResponse<Template> & {
    stats?: TemplateStats;
};

/* ══════════════════════════════════════════════
   CATEGORY
   ══════════════════════════════════════════════ */

export interface Category extends BaseDocument {
    name: string;
    description?: string;
    templateIds: string[];
    templates?: Template[];
    templateCount?: number;
}

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    templateIds?: string[];
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
    id: string;
}

export interface CategoryFilters extends ListFilters { }

export type PaginatedCategoriesResponse = PaginatedResponse<Category>;

/* ══════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════ */

export interface PageSeo {
    title?: string;
    description?: string;
    keywords?: string[];
}

export interface PageStats {
    views: number;
    visitors: number;
}

export interface PageSubscription {
    [key: string]: unknown;
}

export interface PageExtraServices {
    [key: string]: unknown;
}

export interface PageSettings {
    [key: string]: unknown;
}

export interface Page extends BaseDocument {
    title: string;
    description?: string;
    url: string;
    jason: Record<string, unknown>;
    selectedTemplateId?: string;
    selectedTemplate?: Template;
    ownerId: string;
    owner?: User;
    bgImage?: string;
    blocks: Record<string, unknown>[];
    logo?: string;
    favicon?: string;
    pageData?: Record<string, unknown>;
    extraServices?: PageExtraServices;
    subscription?: PageSubscription;
    seo: PageSeo;
    settings?: PageSettings;
    stats: PageStats;
}

export interface CreatePagePayload {
    title: string;
    description?: string;
    url: string;
    jason: Record<string, unknown>;
    selectedTemplateId?: string;
    ownerId: string;
    bgImage?: string;
    blocks?: Record<string, unknown>[];
    logo?: string;
    favicon?: string;
    pageData?: Record<string, unknown>;
    extraServices?: PageExtraServices;
    subscription?: PageSubscription;
    seo?: PageSeo;
    settings?: PageSettings;
}

export interface UpdatePagePayload extends Partial<Omit<CreatePagePayload, "ownerId" | "url">> {
    id: string;
    url?: string;
}

export interface PageFilters extends ListFilters {
    ownerId?: string;
    selectedTemplateId?: string;
}

export interface PageSummaryStats {
    total: number;
    totalViews: number;
    totalVisitors: number;
    byOwner: Record<string, number>;
}

export type PaginatedPagesResponse = PaginatedResponse<Page> & {
    stats?: PageSummaryStats;
};

/* ══════════════════════════════════════════════
   FILE
   ══════════════════════════════════════════════ */

export interface FileDoc extends BaseDocument {
    filename: string;
    path: string;
    ownerId: string;
    owner?: User;
    /** Derived from filename or path */
    extension?: string;
    /** File size in bytes (if available) */
    size?: number;
    /** MIME type (if available) */
    mimeType?: string;
    /** Full public URL */
    publicUrl?: string;
}

export interface UploadFilePayload {
    file: File | Blob;
    ownerId: string;
    filename?: string;
}

export interface FileFilters extends ListFilters {
    ownerId?: string;
    extension?: string;
    mimeType?: string;
}

export interface FileStats {
    total: number;
    totalSize: number;
    byExtension: Record<string, number>;
    byOwner: Record<string, number>;
}

export type PaginatedFilesResponse = PaginatedResponse<FileDoc> & {
    stats?: FileStats;
};

/* ══════════════════════════════════════════════
   NOTIFICATION
   ══════════════════════════════════════════════ */

export interface Notification extends BaseDocument {
    userId?: string;
    user?: User;
    message: string;
    closeable: boolean;
    isGlobal: boolean;
    /** Whether this user has read/dismissed it */
    isRead?: boolean;
    /** Whether this user has closed it */
    isClosed?: boolean;
}

export interface CreateNotificationPayload {
    userId?: string;
    message: string;
    closeable?: boolean;
    isGlobal?: boolean;
}

export interface UpdateNotificationPayload {
    id: string;
    message?: string;
    closeable?: boolean;
    isGlobal?: boolean;
}

export interface MarkNotificationPayload {
    id: string;
    isRead?: boolean;
    isClosed?: boolean;
}

export interface NotificationFilters extends ListFilters {
    userId?: string;
    isGlobal?: boolean;
    isRead?: boolean;
    isClosed?: boolean;
}

export interface NotificationStats {
    total: number;
    unread: number;
    global: number;
}

export type PaginatedNotificationsResponse = PaginatedResponse<Notification> & {
    stats?: NotificationStats;
};

/* ══════════════════════════════════════════════
   PRODUCT
   ══════════════════════════════════════════════ */

export interface Product extends BaseDocument {
    name: string;
    description?: string;
    price: number;
    images: string[];
    /** Formatted price for display */
    formattedPrice?: string;
}

export interface CreateProductPayload {
    name: string;
    description?: string;
    price: number;
    images?: string[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
    id: string;
}

export interface ProductFilters extends ListFilters {
    minPrice?: number;
    maxPrice?: number;
}

export interface ProductStats {
    total: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
}

export type PaginatedProductsResponse = PaginatedResponse<Product> & {
    stats?: ProductStats;
};

/* ══════════════════════════════════════════════
   QR CODE
   ══════════════════════════════════════════════ */

export interface QrCode extends BaseDocument {
    pageId: string;
    page?: Page;
    ownerId: string;
    owner?: User;
    targetUrl: string;
    imageUrl?: string;
    shortCode: string;
    isActive: boolean;
    /** Full short URL for sharing */
    shortUrl?: string;
    /** Scan count (if tracked) */
    scanCount?: number;
}

export interface CreateQrCodePayload {
    pageId: string;
    ownerId: string;
    targetUrl: string;
    imageUrl?: string;
    shortCode?: string;
}

export interface UpdateQrCodePayload extends Partial<Omit<CreateQrCodePayload, "ownerId" | "pageId">> {
    id: string;
    isActive?: boolean;
}

export interface QrCodeFilters extends ListFilters {
    ownerId?: string;
    pageId?: string;
    isActive?: boolean;
}

export interface QrCodeStats {
    total: number;
    active: number;
    inactive: number;
    totalScans: number;
}

export type PaginatedQrCodesResponse = PaginatedResponse<QrCode> & {
    stats?: QrCodeStats;
};

/* ══════════════════════════════════════════════
   TICKET
   ══════════════════════════════════════════════ */

export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface Ticket extends BaseDocument {
    title: string;
    description?: string;
    status: TicketStatus;
    priority: TicketPriority;
    requesterId: string;
    requester?: User;
    assigneeId?: string;
    assignee?: User;
    categoryId?: string;
    category?: Category;
    attachmentIds: string[];
    attachments?: FileDoc[];
    /** Number of replies (if tracked) */
    replyCount?: number;
    /** Last reply date (if tracked) */
    lastReplyAt?: string;
    /** Whether requester has unread replies */
    hasUnreadReply?: boolean;
}

export interface CreateTicketPayload {
    title: string;
    description?: string;
    priority?: TicketPriority;
    requesterId: string;
    assigneeId?: string;
    categoryId?: string;
    attachmentIds?: string[];
}

export interface UpdateTicketPayload extends Partial<Omit<CreateTicketPayload, "requesterId">> {
    id: string;
    status?: TicketStatus;
}

export interface TicketFilters extends ListFilters {
    status?: TicketStatus;
    priority?: TicketPriority;
    requesterId?: string;
    assigneeId?: string;
    categoryId?: string;
}

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    byPriority: {
        low: number;
        medium: number;
        high: number;
    };
    avgResolutionTimeHours?: number;
}

export type PaginatedTicketsResponse = PaginatedResponse<Ticket> & {
    stats?: TicketStats;
};

/* ══════════════════════════════════════════════
   TICKET REPLY (bonus — you'll need it)
   ══════════════════════════════════════════════ */

export interface TicketReply extends BaseDocument {
    ticketId: string;
    authorId: string;
    author?: User;
    message: string;
    attachmentIds: string[];
    attachments?: FileDoc[];
    isStaff: boolean;
}

export interface CreateTicketReplyPayload {
    ticketId: string;
    authorId: string;
    message: string;
    attachmentIds?: string[];
    isStaff?: boolean;
}

export type PaginatedTicketRepliesResponse = PaginatedResponse<TicketReply>;

/* ══════════════════════════════════════════════
   AUTH (bonus — you'll need it)
   ══════════════════════════════════════════════ */

export interface OtpRequestPayload {
    phoneNumber: string;
}

export interface OtpVerifyPayload {
    phoneNumber: string;
    code: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
    isNewUser: boolean;
}

export interface RefreshTokenPayload {
    refreshToken: string;
}

export interface SessionInfo {
    user: User;
    permissions: Permission[];
    accesses: Access[];
}

/* ══════════════════════════════════════════════
   DASHBOARD STATS (bonus — for admin panel)
   ══════════════════════════════════════════════ */

export interface DashboardStats {
    users: UserStats;
    agents: AgentStats;
    pages: PageSummaryStats;
    tickets: TicketStats;
    files: FileStats;
    notifications: NotificationStats;
    products: ProductStats;
    qrCodes: QrCodeStats;
}

export interface DashboardChartData {
    label: string;
    value: number;
}

export interface DashboardTimeSeries {
    date: string;
    users: number;
    pages: number;
    views: number;
}

export interface DashboardOverview {
    stats: DashboardStats;
    recentUsers: User[];
    recentPages: Page[];
    recentTickets: Ticket[];
    chartData: {
        userGrowth: DashboardTimeSeries[];
        pageViews: DashboardTimeSeries[];
        ticketsByStatus: DashboardChartData[];
        usersByRole: DashboardChartData[];
    };
}

/* ══════════════════════════════════════════════
   API ERROR RESPONSE
   ══════════════════════════════════════════════ */

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
    stack?: string;
}

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    error: ApiError;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/* ══════════════════════════════════════════════
   FORM HELPERS
   ══════════════════════════════════════════════ */

/** Generic select option used in forms and filters */
export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
    icon?: string;
}

/** User role options for dropdowns */
export const USER_ROLE_OPTIONS: SelectOption[] = [
    { label: "کاربر", value: "user" },
    { label: "نماینده", value: "agent" },
    { label: "مدیر", value: "admin" },
    { label: "سوپر ادمین", value: "superAdmin" },
];

/** User status options for dropdowns */
export const USER_STATUS_OPTIONS: SelectOption[] = [
    { label: "فعال", value: "active" },
    { label: "غیرفعال", value: "inactive" },
    { label: "مسدود", value: "blocked" },
    { label: "در انتظار", value: "pending" },
];

/** Agent type options for dropdowns */
export const AGENT_TYPE_OPTIONS: SelectOption[] = [
    { label: "حقیقی", value: "personal" },
    { label: "حقوقی", value: "company" },
];

/** Ticket status options for dropdowns */
export const TICKET_STATUS_OPTIONS: SelectOption[] = [
    { label: "باز", value: "open" },
    { label: "در حال بررسی", value: "in_progress" },
    { label: "بسته", value: "closed" },
];

/** Ticket priority options for dropdowns */
export const TICKET_PRIORITY_OPTIONS: SelectOption[] = [
    { label: "کم", value: "low" },
    { label: "متوسط", value: "medium" },
    { label: "زیاد", value: "high" },
];

/** Access action options for dropdowns */
export const ACCESS_ACTION_OPTIONS: SelectOption[] = [
    { label: "مشاهده", value: "view" },
    { label: "ایجاد", value: "create" },
    { label: "ویرایش", value: "update" },
    { label: "حذف", value: "delete" },
    { label: "انتشار", value: "publish" },
];
