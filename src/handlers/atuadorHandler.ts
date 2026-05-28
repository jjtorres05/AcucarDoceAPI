import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { AuthContext } from "../types";
import { parseAndValidate } from "../middleware/validateBody";
import { criarAtuadorSchema, atualizarAtuadorSchema } from "../schemas/atuadorSchema";
import { atuadorService } from "../services/atuadorService";
import { ok, created, handleError } from "../utils/httpResponse";

export const atuadorHandler = {
    criar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const input = await parseAndValidate(request, criarAtuadorSchema);
        const result = await atuadorService.criar(auth, input);
        return created(result, "Atuador criado com sucesso");
    },

    listar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        const dispositivoId = request.query.get("dispositivoId");
        if (id) {
            const result = await atuadorService.obterPorId(auth, id);
            return ok(result);
        }
        if (dispositivoId) {
            const result = await atuadorService.listarPorDispositivo(auth, dispositivoId);
            return ok(result);
        }
        const result = await atuadorService.listarPorEmpresa(auth);
        return ok(result);
    },

    atualizar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const input = await parseAndValidate(request, atualizarAtuadorSchema);
        const result = await atuadorService.atualizar(auth, input);
        return ok(result, "Atuador atualizado com sucesso");
    },

    desativar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("parametro Id faltando na query"));
        }
        await atuadorService.desativar(auth, id);
        return ok(null, "Atuador desativo com sucesso");
    },

    deletar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("Parametro id ausente"));
        }
        await atuadorService.deletar(auth, id);
        return ok(null, "Atuador deletado com sucesso");
    },
};