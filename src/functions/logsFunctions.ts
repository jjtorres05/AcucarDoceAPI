import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { logHandler } from "../handlers/logHandler";
import { handleError } from "../utils/httpResponse";

async function logCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[logs] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const empresaIdOfuscado = request.query.get("empresaId");
        if(!empresaIdOfuscado){
            return {status: 400, jsonBody: {success: false, error: "empresaId ausente"}};
        }
        const usuario = await verificarUsuario(token,empresaIdOfuscado);
        const auth = { usuario_id: usuario.id, empresa_id: usuario.empresa.id };

        if (request.method === "GET") {
            checkPermission(usuario, "listar");
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