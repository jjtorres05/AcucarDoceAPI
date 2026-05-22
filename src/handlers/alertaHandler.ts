import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { extractAuthContext, extractToken, checkPermission } from "../middleware/authGuard";
import { parseAndValidate } from "../middleware/validateBody";
import { criarAlertaSchema } from "../schemas/alertaSchema";
import { alertaService } from "../services/alertaService";
import { handleError, ok, created } from "../utils/httpResponse";

export const alertaHandler = {
    criar: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const token = extractToken(request);
            await checkPermission(token, auth.empresa_id, "alerta", "criar");

            const input = await parseAndValidate(request, criarAlertaSchema);
            const result = await alertaService.criar(auth, input);
            return created(result, "Alerta criado com sucesso");
        } catch (erro) {
            return handleError(erro);
        }
    },

    listarPorEmpresa: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const result = await alertaService.listarPorEmpresa(auth);
            return ok(result);
        } catch (erro) {
            return handleError(erro);
        }
    },

    listarPorDispositivo: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const dispositivoId = request.params.dispositivoId;
            if (!dispositivoId) {
                return handleError(new Error("Parametro dispositivoId faltando"));
            }
            const result = await alertaService.listarPorDispositivo(auth, dispositivoId);
            return ok(result);
        } catch (erro) {
            return handleError(erro);
        }
    },

    listarPorSensor: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const sensorId = request.params.sensorId;
            if (!sensorId) {
                return handleError(new Error("Parametro sensorId faltando"));
            }
            const result = await alertaService.listarPorSensor(auth, sensorId);
            return ok(result);
        } catch (erro) {
            return handleError(erro);
        }
    },

    obterPorId: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const id = request.params.id;
            if (!id) {
                return handleError(new Error("Parametro Id faltando"));
            }
            const result = await alertaService.obterPorId(auth, id);
            return ok(result);
        } catch (erro) {
            return handleError(erro);
        }
    },
};