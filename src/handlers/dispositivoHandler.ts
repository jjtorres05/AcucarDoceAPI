import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { AuthContext } from "../types";
import { parseAndValidate } from "../middleware/validateBody";
import { criarDispositivoSchema, atualizarDispositivoSchema } from "../schemas/dispositivoSchema";
import { dispositivoService } from "../services/dispositivoService";
import { ok, created, handleError } from "../utils/httpResponse";

export const dispositivoHandler = {
    criar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const input = await parseAndValidate(request, criarDispositivoSchema);
        const result = await dispositivoService.criar(auth, input);
        return created(result, "Dispositivo criado. Guarde o token - ele nao sera exibido novamente");
    },

    listar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (id) {
            const result = await dispositivoService.obTerPorId(auth, id);
            return ok(result);
        }
        const result = await dispositivoService.listar(auth);
        return ok(result);
    },

    atualizar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const input = await parseAndValidate(request, atualizarDispositivoSchema);
        const result = await dispositivoService.atualizar(auth, input);
        return ok(result, "Dispositivo atualizado com sucesso");
    },

    desativar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("Parâmetro id ausente"));
        }
        await dispositivoService.desativar(auth, id);
        return ok(null, "Dispositivo desativado com sucesso");
    },

    deletar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("Parametro id ausente"));
        }
        await dispositivoService.deletar(auth, id);
        return ok(null, "Dispositivo deletado com sucesso");
    },

    regenerarToken: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        if (!id) {
            return handleError(new Error("Parâmetro id ausente"));
        }
        const result = await dispositivoService.regenerarToken(auth, id);
        return ok(result, "Token regenerado. Guarde o token — ele não será exibido novamente.");
    },
};