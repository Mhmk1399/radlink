import bcrypt from "bcrypt";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
const BCRYPT_ROUNDS = 12;

export function validateStrongPassword(
  password: unknown,
  options?: { phoneNumber?: string },
): string | null {
  if (typeof password !== "string") {
    return "رمز عبور الزامی است.";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return "رمز عبور نباید بیشتر از ۷۲ کاراکتر باشد.";
  }

  if (/\s/.test(password)) {
    return "رمز عبور نباید فاصله داشته باشد.";
  }

  if (!/[a-z]/.test(password)) {
    return "رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد.";
  }

  if (!/[A-Z]/.test(password)) {
    return "رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد.";
  }

  if (!/\d/.test(password)) {
    return "رمز عبور باید حداقل یک عدد داشته باشد.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "رمز عبور باید حداقل یک نشانه مثل ! یا @ داشته باشد.";
  }

  const phoneNumber = options?.phoneNumber;
  if (phoneNumber && password.includes(phoneNumber)) {
    return "رمز عبور نباید شامل شماره موبایل باشد.";
  }

  return null;
}

export function isPasswordConfigured(user: { passwordHash?: string | null }) {
  return Boolean(user.passwordHash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
