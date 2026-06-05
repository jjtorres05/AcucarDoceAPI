import { HttpRequest } from "@azure/functions";
import { UsuarioVerificado } from "../types";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { getConectaApiUrl } from "../utils/conectaApi";
import { deobfuscateId } from "../utils/obfuscateId";


export function extractToken(request: HttpRequest): string {
    //primero tenta ler o header authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    
    //faz fallback e le a cookie
    const cookieHeader = request.headers.get("cookie");
    if(cookieHeader){
        const match = cookieHeader?.split(";").map(c=> c.trim()).find(c=>c.startsWith("auth_token="));
        if(match){
            return match.split("=")[1] ?? "";
        }
    }
    throw new UnauthorizedError("Token ausente ou invalido");
}

export async function verificarUsuario(
    token: string,
    empresaIdOfuscado: string
): Promise <UsuarioVerificado> {
    const response = await fetch(`${getConectaApiUrl()}/auth/verificar?empresaId=${empresaIdOfuscado}`,{
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if(!response.ok){
        const data = await response.json();
        if(response.status === 403){
            throw new ForbiddenError(data.error || "Acesso negados");
        }
        throw new UnauthorizedError(data.error || "Token invalido");
    }
    return await response.json() as UsuarioVerificado;
}


export function extrairEmpresaId(request: HttpRequest): number {
    const empresaIdParam = request.query.get("empresaId");
    if(!empresaIdParam){
        throw new UnauthorizedError("Parametro empresaId ausente na rota");
    }
    return deobfuscateId("empresa",empresaIdParam);
}



export function checkPermission(
    usuario: UsuarioVerificado,
    acao: string,
    ): void {
    //admin interno pode tudo
    if(usuario.tipo === "interno" && usuario.rolInterno === "admin_interno"){
        return;
    }
    //admin_externo pode tudo dentro da sua empresa
    if (usuario.empresa.rolEmpresa === "admin_externo"){
        return;
    }
    //comum_externo pode só listar
    if(acao === "listar"){
        return;
    }
    throw new ForbiddenError("Usuario nao tem permisao para esta acao");

}