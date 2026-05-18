import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
//crypt js
const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;

export function generateDeviceToken(): string {
    return randomBytes(TOKEN_BYTES).toString("hex");
}

export async function hashDeviceToken(token: string): Promise<string> {
    return bcrypt.hash(token, SALT_ROUNDS);
}

export async function verifyDeviceToken(
    token: string,
    hash: string
    ): Promise<boolean> {
    return bcrypt.compare(token, hash);
}