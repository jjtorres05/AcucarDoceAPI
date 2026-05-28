import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { sensorHandler } from "../handlers/sensorHandler";
import { handleError } from "../utils/httpResponse";


async function sensorCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[sensores] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const empresaIdOfuscado = request.query.get("empresaId");
        if(!empresaIdOfuscado){
            return {status: 400, jsonBody: {success: false, error: "empresaId ausente"}};
        }
        const usuario = await verificarUsuario(token, empresaIdOfuscado);
        const auth = { usuario_id: usuario.id, empresa_id: usuario.empresa.id };

        if (request.method === "GET") {
            checkPermission(usuario, "listar");
            return await sensorHandler.listar(request, auth);
        }
        else if (request.method === "POST") {
            checkPermission(usuario, "criar");
            return await sensorHandler.criar(request, auth);
        }
        else if (request.method === "PUT") {
            checkPermission(usuario, "atualizar");
            return await sensorHandler.atualizar(request, auth);
        }
        else if (request.method === "PATCH") {
            checkPermission(usuario, "deletar");
            return await sensorHandler.desativar(request, auth);
        }
        else if (request.method === "DELETE") {
            checkPermission(usuario, "deletar");
            return await sensorHandler.deletar(request, auth);
        }

        return { status: 405, jsonBody: { success: false, error: "Método não permitido" } };
    } catch (erro) {
        context.error(`[sensores] Erro:`, erro);
        return handleError(erro);
    }
}

app.http("sensores", {
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    authLevel: "anonymous",
    route: "sensores",
    handler: sensorCrud,
});