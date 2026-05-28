import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { extractToken, verificarUsuario, extrairEmpresaId, checkPermission } from "../middleware/authGuard";
import { dispositivoHandler } from "../handlers/dispositivoHandler";
import { handleError } from "../utils/httpResponse";


async function dispositivoCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[dispositivos] ${request.method} ${request.url}`);

        const token = extractToken(request);
        const empresaIdOfuscado = request.query.get("empresaId");
        if(!empresaIdOfuscado){
            return {status: 400, jsonBody: {success: false, error: "empresaId ausente"}};
        }
        const usuario = await verificarUsuario(token,empresaIdOfuscado);
        const auth = { usuario_id: usuario.id, empresa_id: usuario.empresa.id };

        if (request.method === "GET") {
            checkPermission(usuario, "listar");
            return await dispositivoHandler.listar(request, auth);
        }
        else if (request.method === "POST") {
            const acao = request.query.get("acao");
            if (acao === "regenerar-token") {
                checkPermission(usuario, "atualizar");
                return await dispositivoHandler.regenerarToken(request, auth);
            }
            checkPermission(usuario, "criar");
            return await dispositivoHandler.criar(request, auth);
        }
        else if (request.method === "PUT") {
            checkPermission(usuario, "atualizar");
            return await dispositivoHandler.atualizar(request, auth);
        }
        else if (request.method === "PATCH") {
            checkPermission(usuario, "deletar");
            return await dispositivoHandler.desativar(request, auth);
        }
        else if (request.method === "DELETE") {
            checkPermission(usuario, "deletar");
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