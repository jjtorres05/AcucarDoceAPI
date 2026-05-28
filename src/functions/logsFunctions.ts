import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { logHandler } from "../handlers/logHandler";
import { handleError } from "../utils/httpResponse";

async function logCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[logs] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const usuario = await verificarUsuario(token);
        const empresa_id = extrairEmpresaId(request);
        const auth = { usuario_id: usuario.id, empresa_id };

        if (request.method === "GET") {
            checkPermission(usuario, empresa_id, "listar");
            return await logHandler.listar(request, auth);
        }

        return { status: 405, jsonBody: { success: false, error: "Método não permitido" } };
    } catch (erro) {
        context.error(`[logs] Erro:`, erro);
        return handleError(erro);
    }
}

app.http("logs", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "logs",
    handler: logCrud,
});