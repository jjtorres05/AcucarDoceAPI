import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { atuadorHandler } from "../handlers/atuadorHandler";
import { handleError } from "../utils/httpResponse";

async function atuadorCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[atuadores] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const usuario = await verificarUsuario(token);
        const empresa_id = extrairEmpresaId(request);
        const auth = { usuario_id: usuario.id, empresa_id };

        if (request.method === "GET") {
            checkPermission(usuario, empresa_id, "listar");
            return await atuadorHandler.listar(request, auth);
        }
        else if (request.method === "POST") {
            checkPermission(usuario, empresa_id, "criar");
            return await atuadorHandler.criar(request, auth);
        }
        else if (request.method === "PUT") {
            checkPermission(usuario, empresa_id, "atualizar");
            return await atuadorHandler.atualizar(request, auth);
        }
        else if (request.method === "PATCH") {
            checkPermission(usuario, empresa_id, "deletar");
            return await atuadorHandler.desativar(request, auth);
        }
        else if (request.method === "DELETE") {
            checkPermission(usuario, empresa_id, "deletar");
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