import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { AuthContext } from "../types";
import { parseAndValidate } from "../middleware/validateBody";
import { criarSensorSchema, atualizarSensorSchema } from "../schemas/sensorSchema";
import { sensorService } from "../services/sensorService";
import { ok, created, handleError } from "../utils/httpResponse";

export const sensorHandler = {
    criar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const input = await parseAndValidate(request, criarSensorSchema);
        const result = await sensorService.criar(auth, input);
        return created(result, "Sensor criado com sucesso");
    },

    listar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        const dispositivoId = request.query.get("dispositivoId");
        if (id) {
            const result = await sensorService.obterPorId(auth, id);
            return ok(result);
        }
        if (dispositivoId) {
            const result = await sensorService.listarPorDispositivo(auth, dispositivoId);
            return ok(result);
        }
        const result = await sensorService.listarPorEmpresa(auth);
        return ok(result);
    },

    atualizar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const input = await parseAndValidate(request, atualizarSensorSchema);
        const result = await sensorService.atualizar(auth, input);
        return ok(result, "Sensor atualizado com sucesso");
    },

    desativar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("Parametro Id faltando na query"));
        }
        await sensorService.desativar(auth, id);
        return ok(null, "Sensor desativo com sucesso");
    },

    deletar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("Parametro id ausente"));
        }
        await sensorService.deletar(auth, id);
        return ok(null, "Sensor deletado com sucesso");
    },
};