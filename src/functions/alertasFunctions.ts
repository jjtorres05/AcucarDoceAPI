import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { alertaHandler } from "../handlers/alertaHandler";
import { handleError } from "../utils/httpResponse";

async function alertaCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[alertas] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const usuario = await verificarUsuario(token);
        const empresa_id = extrairEmpresaId(request);
        const auth = { usuario_id: usuario.id, empresa_id };

        if (request.method === "GET") {
            checkPermission(usuario, empresa_id, "listar");
            return await alertaHandler.listar(request, auth);
        }
        else if (request.method === "POST") {
            checkPermission(usuario, empresa_id, "criar");
            return await alertaHandler.criar(request, auth);
        }
        else if (request.method === "DELETE") {
            checkPermission(usuario, empresa_id, "deletar");
            return await alertaHandler.deletar(request, auth);
        }

        return { status: 405, jsonBody: { success: false, error: "Método não permitido" } };
    } catch (erro) {
        context.error(`[alertas] Erro:`, erro);
        return handleError(erro);
    }
}

app.http("alertas", {
    methods: ["GET", "POST", "DELETE"],
    authLevel: "anonymous",
    route: "alertas",
    handler: alertaCrud,
});