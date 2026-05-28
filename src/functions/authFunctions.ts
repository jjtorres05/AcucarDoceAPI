import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { authHandler } from "../handlers/authHandler";
import { handleError } from "../utils/httpResponse";

async function authCrud(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`[auth] ${request.method} ${request.url}`);

        const acao = request.query.get("acao");

        if (request.method === "POST" && acao === "registro") {
            return await authHandler.registro(request);
        }
        else if (request.method === "POST") {
            return await authHandler.login(request);
        }
        else if (request.method === "GET") {
            return await authHandler.listarEmpresas(request);
        }

        return { status: 405, jsonBody: { success: false, error: "Método não permitido" } };
    } catch (erro) {
        context.error(`[auth] Erro:`, erro);
        return handleError(erro);
    }
}

app.http("auth", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "auth",
    handler: authCrud,
});