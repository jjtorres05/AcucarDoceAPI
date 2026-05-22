import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { extractAuthContext,extractToken,checkPermission } from "../middleware/authGuard";
import { parseAndValidate } from "../middleware/validateBody";
import { criarSensorSchema, atualizarSensorSchema } from "../schemas/sensorSchema";
import { sensorService } from "../services/sensorService";
import { handleError,ok, created } from "../utils/httpResponse";

export const sensorHandler={
    criar: async (request: HttpRequest):
    Promise <HttpResponseInit>=>{
        try {
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token,auth.empresa_id,"sensor","criar");

            const input = await parseAndValidate(request, criarSensorSchema);
            const result = await sensorService.criar(auth,input);
            return created(result,"Sensor criado com sucesso");
        }catch (erro){
            return handleError(erro);
        }
    },

    listarPorDispositivo: async (request: HttpRequest):
    Promise<HttpResponseInit> =>{
        try{
            const auth= extractAuthContext(request);
            const dispositivoId = request.params.dispositivoId;
            if(!dispositivoId){
                return handleError(new Error("Parametro dispositivoId faltando"));
            }
            const result = await sensorService.listarPorDispositivo(auth,dispositivoId);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },

    listarPorEmpresa: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const result = await sensorService.listarPorEmpresa(auth);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },

    obterPorId: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const id= request.params.id;
            if(!id){
                return handleError(new Error("parametro Id faltando"));
            }
            const result= await sensorService.obterPorId(auth,id);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },

    atualizar: async(request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token,auth.empresa_id,"sensor","atualizar");

            const input = await parseAndValidate(request, atualizarSensorSchema);
            const result = await sensorService.atualizar(auth,input);
            return ok(result, "Sensor atualizado com sucesso");
        }catch (erro){
            return handleError(erro);
        }
    },

    desativar: async(request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token,auth.empresa_id,"sensor","deletar");
            const id= request.params.id;
            if(!id){
                return handleError(new Error("Parametro Id faltando"));
            }
            await sensorService.desativar(auth,id);
            return ok(null, "Sensor desativo com sucesso");
        }catch (erro){
            return handleError(erro);
        }
    },
};