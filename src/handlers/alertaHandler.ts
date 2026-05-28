import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { AuthContext } from "../types";
import { parseAndValidate } from "../middleware/validateBody";
import { criarAlertaSchema } from "../schemas/alertaSchema";
import { alertaService } from "../services/alertaService";
import { ok, created, handleError } from "../utils/httpResponse";

export const alertaHandler = {
    criar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const input = await parseAndValidate(request, criarAlertaSchema);
        const result = await alertaService.criar(auth, input);
        return created(result, "Alerta criado com sucesso");
    },

    listar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        const dispositivoId = request.query.get("dispositivoId");
        const sensorId = request.query.get("sensorId");

        if (id) {
            const result = await alertaService.obterPorId(auth, id);
            return ok(result);
        }
        if (dispositivoId) {
            const result = await alertaService.listarPorDispositivo(auth, dispositivoId);
            return ok(result);
        }
        if (sensorId) {
            const result = await alertaService.listarPorSensor(auth, sensorId);
            return ok(result);
        }
        const result = await alertaService.listarPorEmpresa(auth);
        return ok(result);
    },

    deletar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("Parametro id ausente"));
        }
        await alertaService.deletar(auth, id);
        return ok(null, "Alerta deletado com sucesso");
    },
};