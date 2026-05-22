import { HttpRequest } from "@azure/functions";
import jwt from "jsonwebtoken";
import { AuthContext, JwtPayload } from "../types";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET nao definido");
    }
    return secret;
}

function getConectaApiUrl(): string {
    const url = process.env.CONECTA_API_URL;
    if (!url) {
        throw new Error("CONECTA_API_URL nao esta definido");
    }
    return url;
}

export function extractAuthContext(request: HttpRequest): AuthContext {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Header Authorization ausente ou inválido");
    }

    const token = authHeader.substring(7);
    const empresaIdParam= request.params.empresaId;
    if(!empresaIdParam){
        throw new UnauthorizedError("Parametro empresaId ausente na rota");
    }

    const empresa_id = parseInt(empresaIdParam, 10);
    if (isNaN(empresa_id)) {
        throw new UnauthorizedError("empresaId invalido");
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

        return {
            usuario_id: decoded.id,
            empresa_id,
        };
    } catch {
        throw new UnauthorizedError("Token inválido ou expirado");
    }
}

export function extractToken(request: HttpRequest): string {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Header Authorization ausente ou inválido");
    }
    return authHeader.substring(7);
}

export async function checkPermission(
    token: string,
    empresa_id: number,
    recurso: string,
    acao: string
    ): Promise<void> {
    const url = `${getConectaApiUrl()}/permissoes/verificar`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ empresa_id, recurso, acao }),
    });

    if (!response.ok) {
        throw new ForbiddenError("Usuário não tem permissão para esta ação");
    }
}