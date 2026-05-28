import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { atuadorHandler } from "../handlers/atuadorHandler";
import { handleError } from "../utils/httpResponse";
import { success } from "zod/v4";
import { error } from "console";

async function atuadorCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[atuadores] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const empresaIdOfuscado= request.query.get("empresaId");
        if(!empresaIdOfuscado){
            return {status: 400, jsonBody: {success: false, error: "empresaId ausente"}};
        }
        const usuario = await verificarUsuario(token, empresaIdOfuscado);
        const auth = { usuario_id: usuario.id, empresa_id: usuario.empresa.id };

        if (request.method === "GET") {
            checkPermission(usuario, "listar");
            return await atuadorHandler.listar(request, auth);
        }
        else if (request.method === "POST") {
            checkPermission(usuario, "criar");
            return await atuadorHandler.criar(request, auth);
        }
        else if (request.method === "PUT") {
            checkPermission(usuario, "atualizar");
            return await atuadorHandler.atualizar(request, auth);
        }
        else if (request.method === "PATCH") {
            checkPermission(usuario, "deletar");
            return await atuadorHandler.desativar(request, auth);
        }
        else if (request.method === "DELETE") {
            checkPermission(usuario, "deletar");
            return await atuadorHandler.deletar(request, auth);
        }

        return { status: 405, jsonBody: { success: false, error: "Método não permitido" } };
    } catch (erro) {
        context.error(`[atuadores] Erro:`, erro);
        return handleError(erro);
    }
}

app.http("atuadores", {
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    authLevel: "anonymous",
    route: "atuadores",
    handler: atuadorCrud,
});