import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { alertaHandler } from "../handlers/alertaHandler";
import { handleError } from "../utils/httpResponse";
import { success } from "zod/v4";
import { error } from "console";

async function alertaCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[alertas] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const empresaIdOfuscado = request.query.get("empresaId");
        if(!empresaIdOfuscado){
            return {status: 400, jsonBody: {success: false, error: "empresaId ausente"}};
        }
        const usuario = await verificarUsuario(token, empresaIdOfuscado);
        const auth = { usuario_id: usuario.id, empresa_id: usuario.empresa.id };

        if (request.method === "GET") {
            checkPermission(usuario, "listar");
            return await alertaHandler.listar(request, auth);
        }
        else if (request.method === "POST") {
            checkPermission(usuario, "criar");
            return await alertaHandler.criar(request, auth);
        }
        else if (request.method === "DELETE") {
            checkPermission(usuario, "deletar");
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