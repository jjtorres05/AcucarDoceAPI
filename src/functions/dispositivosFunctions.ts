import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { dispositivoHandler } from "../handlers/dispositivoHandler";
import { handleError } from "../utils/httpResponse";

async function dispositivoCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[dispositivos] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const usuario = await verificarUsuario(token);
        const empresa_id = extrairEmpresaId(request);
        const auth = { usuario_id: usuario.id, empresa_id };

        if (request.method === "GET") {
            checkPermission(usuario, empresa_id, "listar");
            return await dispositivoHandler.listar(request, auth);
        }
        else if (request.method === "POST") {
            const acao = request.query.get("acao");
            if (acao === "regenerar-token") {
                checkPermission(usuario, empresa_id, "atualizar");
                return await dispositivoHandler.regenerarToken(request, auth);
            }
            checkPermission(usuario, empresa_id, "criar");
            return await dispositivoHandler.criar(request, auth);
        }
        else if (request.method === "PUT") {
            checkPermission(usuario, empresa_id, "atualizar");
            return await dispositivoHandler.atualizar(request, auth);
        }
        else if (request.method === "PATCH") {
            checkPermission(usuario, empresa_id, "deletar");
            return await dispositivoHandler.desativar(request, auth);
        }
        else if (request.method === "DELETE") {
            checkPermission(usuario, empresa_id, "deletar");
            return await dispositivoHandler.deletar(request, auth);
        }

        return { status: 405, jsonBody: { success: false, error: "Método não permitido" } };
    } catch (erro) {
        context.error(`[dispositivos] Erro:`, erro);
        return handleError(erro);
    }
}

app.http("dispositivos", {
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    authLevel: "anonymous",
    route: "dispositivos",
    handler: dispositivoCrud,
});