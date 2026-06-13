import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { AUTH_CONFIG } from "./auth-config";

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: Omit<TokenPayload, "iat" | "exp">,
  type: "customer" | "admin" = "customer"
): Promise<string> {
  const config = AUTH_CONFIG[type];
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.expiresIn)
    .sign(getSecret(config.secret()));
}

export async function verifyToken(
  token: string,
  type: "customer" | "admin" = "customer"
): Promise<TokenPayload | null> {
  try {
    const config = AUTH_CONFIG[type];
    const { payload } = await jwtVerify(token, getSecret(config.secret()));
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
