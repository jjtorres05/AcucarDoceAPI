import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { extractAuthContext, extractToken, checkPermission } from "../middleware/authGuard";
import { parseAndValidate } from "../middleware/validateBody";
import { criarAtuadorSchema, atualizarAtuadorSchema } from "../schemas/atuadorSchema";
import { atuadorService } from "../services/atuadorService";
import { handleError, ok, created } from "../utils/httpResponse";
import { request } from "http";
import { catchall } from "zod/v4-mini";
import { tr } from "zod/v4/locales";

export const atuadorHandler={
    criar: async( request: HttpRequest):
    Promise <HttpResponseInit>=> {
        try{
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token,auth.empresa_id,"atuador","criar");

            const input = await parseAndValidate(request, criarAtuadorSchema);
            const result = await atuadorService.criar(auth,input);
            return created(result,"Atuador criado com sucesso");
        }catch (erro){
            return handleError(erro);
        }
    },

    listarPorDispositivo: async(request: HttpRequest):
    Promise <HttpResponseInit> => {
        try{
            const auth= extractAuthContext(request);
            const dispositivoId= request.params.dispositivoId;
            if(!dispositivoId){
                return handleError(new Error("Parametro dispositivoId faltando"));
            }
            const result = await atuadorService.listarPorDispositivo(auth,dispositivoId);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },

    listarPorEmpresa: async(request: HttpRequest):
    Promise <HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const result = await atuadorService.listarPorEmpresa(auth);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },

    obterPorId : async(request: HttpRequest):
    Promise <HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const id = request.params.id;
            if(!id){
                return handleError(new Error("parametro Id faltando"));
            }
            const result = await atuadorService.obterPorId(auth,id);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },

    atualizar: async(request: HttpRequest):
    Promise <HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token,auth.empresa_id,"atuador","atualizar");
            const id= request.params.id;
            if(!id){
                return handleError(new Error("parametro Id faltando"));
            }
            const input= await parseAndValidate(request,atualizarAtuadorSchema);
            const result= await atuadorService.atualizar(auth,id,input);
            return ok(result,"Atuador atualizado com sucesso");
        }catch (erro){
            return handleError(erro);
        }
    },

    desativar: async(request: HttpRequest):
    Promise <HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token, auth.empresa_id,"atuador","deletar");
            const id= request.params.id;
            if(!id){
                return handleError(new Error("parametro Id faltando"));
            }
            await atuadorService.desativar(auth,id);
            return ok(null,"Atuador desativo com sucesso");
        }catch(erro){
            return handleError(erro);
        }
    },
};