import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { AuthContext } from "../types";
import { logService } from "../services/logService";
import { ok, handleError } from "../utils/httpResponse";

export const logHandler = {
    listar: async (request: HttpRequest, auth: AuthContext):
    Promise<HttpResponseInit> => {
        const id = request.query.get("id");
        const dispositivoId = request.query.get("dispositivoId");

        if (id) {
            const result = await logService.obterPorId(auth, id);
            return ok(result);
        }
        if (dispositivoId) {
            const result = await logService.listarPorDispositivo(auth, dispositivoId);
            return ok(result);
        }
        const result = await logService.listarPorEmpresa(auth);
        return ok(result);
    },
};