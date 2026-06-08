import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, checkPermission } from "../middleware/authGuard";
import { leituraHandler } from "../handlers/leituraHandler";
import { handleError } from "../utils/httpResponse";

async function leituraCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[leituras] ${request.method} ${request.url}`);

        if (request.method === "POST") {
            // Dispositivo mandando leitura — auth diferente (deviceAuthGuard)
            return await leituraHandler.criar(request);
        }
        else if (request.method === "GET") {
            // Usuario consultando leituras — auth normal
            const token = extractToken(request);
            const empresaIdOfuscado = request.query.get("empresaId");
            if (!empresaIdOfuscado) {
                return { status: 400, jsonBody: { success: false, error: "empresaId ausente" } };
            }
            const usuario = await verificarUsuario(token, empresaIdOfuscado);
            const auth = { usuario_id: usuario.id, empresa_id: usuario.empresa.id };
            checkPermission(usuario, "listar");
            return await leituraHandler.listar(request, auth);
        }
        
        return { status: 405, jsonBody: { success: false, error: "Método não permitido" } };
    } catch (erro) {
        context.error(`[leituras] Erro:`, erro);
        return handleError(erro);
    }
}

app.http("leituras", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "leituras",
    handler: leituraCrud,
});