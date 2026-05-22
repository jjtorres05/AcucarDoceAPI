import { HttpRequest,HttpResponseInit } from "@azure/functions";
import { extractAuthContext } from "../middleware/authGuard";
import { logService } from "../services/logService";
import { handleError, ok } from "../utils/httpResponse";

export const logHandler={
    listarPorempresa: async (request: HttpRequest):
    Promise<HttpResponseInit>=> {
        try {
            const auth= extractAuthContext(request);
            const result = await logService.listarPorEmpresa(auth);
            return ok(result);
        }catch(erro){
            return handleError(erro);
        }
    },

    listarPorDispositivo: async(request: HttpRequest):
    Promise<HttpResponseInit>=> {
        try {
            const auth= extractAuthContext(request);
            const dispositivoId= request.params.dispositivoId;
            if(!dispositivoId){
                return handleError(new Error("Parametro dispositivoId faltando"));
            }
            const result = await logService.listarPorDispositivo(auth,dispositivoId);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },

    obterPorId: async (request: HttpRequest):
    Promise<HttpResponseInit>=> {
        try {
            const auth= extractAuthContext(request);
            const id = request.params.id;
            if(!id){
                return handleError(new Error("Parametro Id do dispositivo esta faltando"));
            }
            const result = await logService.obterPorId(auth,id);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },
};