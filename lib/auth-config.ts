export const AUTH_CONFIG = {
  customer: {
    cookieName: "session",
    secret: () => process.env.JWT_SECRET!,
    expiresIn: "7d",
  },
  admin: {
    cookieName: "admin_session",
    secret: () => process.env.ADMIN_JWT_SECRET!,
    expiresIn: "2h",
  },
} as const;
