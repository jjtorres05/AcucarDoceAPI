import { HttpRequest } from "@azure/functions";
import jwt from "jsonwebtoken";
import { AuthContext, UsuarioConecta } from "../types";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { getConectaApiUrl } from "../utils/conectaApi";
import { deobfuscateId } from "../utils/obfuscateId";


export function extractToken(request: HttpRequest): string {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Header Authorization ausente ou inválido");
    }
    return authHeader.substring(7);
}
export async function verificarUsuario(token: string):
Promise <UsuarioConecta> {
    const response = await fetch(`${getConectaApiUrl()}/auth/me`,{
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!response.ok){
        throw new UnauthorizedError("Token invalido ou expirado");
    }
    return await response.json() as UsuarioConecta;
}

export function extrairEmpresaId(request: HttpRequest): number {
    const empresaIdParam = request.query.get("empresaId");
    if(!empresaIdParam){
        throw new UnauthorizedError("Parametro empresaId ausente na rota");
    }
    return deobfuscateId("empresa",empresaIdParam);
}



export function checkPermission(
    usuario: UsuarioConecta,
    empresa_id: number,
    acao: string,
    ): void {
    //admin interno pode tudo
    if(usuario.tipo === "interno" && usuario.rolInterno === "admin_interno"){
        return;
    }
    //procura a empresa do usuario
    const empresa = usuario.empresas.find(e=> e.id === empresa_id);
    if(!empresa){
        throw new ForbiddenError("Usuario nao pertence a esta empresa");
    }
    //admin_externo pode tudo dentro da sua empresa
    if (empresa.rolEmpresa === "admin_externo"){
        return;
    }
    //comum_externo pode só listar
    if(acao === "listar"){
        return;
    }
    throw new ForbiddenError("Usuario nao tem permisao para esta acao");

}