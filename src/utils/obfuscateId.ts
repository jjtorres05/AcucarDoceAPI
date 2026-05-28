import crypto from "node:crypto";
import { ValidationError } from "./errors";

export type TipoId = "dispositivo" | "sensor" | "atuador" | "alerta" | "log" | "empresa";

const secret = process.env.ID_OBFUSCATION_SECRET;
if (!secret) {
    throw new Error("ID_OBFUSCATION_SECRET is not defined");
}
const key = crypto.createHash("sha256").update(secret).digest();

function toBase64Url(buffer: Buffer): string {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    }

    function fromBase64Url(value: string): Buffer {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
        base64 += "=";
    }
    return Buffer.from(base64, "base64");
}

export function obfuscateId(tipo: TipoId, id: number): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const payload = JSON.stringify({ tipo, id });

    const encrypted = Buffer.concat([
        cipher.update(payload, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return toBase64Url(Buffer.concat([iv, authTag, encrypted]));
    }

    export function deobfuscateId(
    expectedTipo: TipoId,
    value: string
    ): number {
    try {
        const data = fromBase64Url(value);

        if (data.length < 29) {
        throw new ValidationError("ID inválido");
        }

        const iv = data.subarray(0, 12);
        const authTag = data.subarray(12, 28);
        const encrypted = data.subarray(28);

        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
        ]).toString("utf8");

        const payload = JSON.parse(decrypted);

        if (payload.tipo !== expectedTipo) {
        throw new ValidationError(
            `Tipo de ID inválido: esperado ${expectedTipo}`
        );
        }

        if (!Number.isInteger(payload.id) || payload.id <= 0) {
        throw new ValidationError("Valor de ID inválido");
        }

        return payload.id;
    } catch (error) {
        if (error instanceof ValidationError) throw error;
        throw new ValidationError("ID inválido ou corrompido");
    }
}