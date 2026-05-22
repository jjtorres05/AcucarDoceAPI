import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { extractAuthContext, extractToken, checkPermission } from "../middleware/authGuard";
import { parseAndValidate } from "../middleware/validateBody";
import { criarDispositivoSchema, atualizarDispositivoSchema } from "../schemas/dispositivoSchema";
import { dispositivoService } from "../services/dispositivoService";
import { ok, created, handleError } from "../utils/httpResponse";
import { request } from "http";
import { promises } from "dns";
import { tr } from "zod/v4/locales";

export const dispositivoHandler ={
    criar: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try{
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token, auth.empresa_id, "dispositivo","criar");
            const input = await parseAndValidate(request, criarDispositivoSchema);
            const result = await dispositivoService.criar(auth,input);
            return created(result,"Dispositivo criado. Guarde o token - elenao sera exibido novamente");

        }catch(erro){
            return handleError(erro);
        }
    },
    listar: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try{
            const auth = extractAuthContext(request);
            const result = await dispositivoService.listar(auth);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },
    obterPorId: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const id = request.params.id;
            if(!id){
                return handleError(new Error("Parametro id ausente"));
            }
            const result = await dispositivoService.obTerPorId(auth,id);
            return ok(result);
        }catch (erro){
            return handleError(erro);
        }
    },
    atualizar: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth= extractAuthContext(request);
            const token= extractToken(request);
            await checkPermission(token, auth.empresa_id,"dispositivo","atualizar");
            const input= await parseAndValidate(request,atualizarDispositivoSchema);
            const result = await dispositivoService.atualizar(auth,input);
            return ok(result,"Dispositivo atualizado com sucesso");
        }catch (erro){
            return handleError(erro);
        }
    },
    desativar: async (request: HttpRequest): Promise<HttpResponseInit> => {
        try {
        const auth = extractAuthContext(request);
        const token = extractToken(request);
        await checkPermission(token, auth.empresa_id, "dispositivo", "deletar");

        const id = request.params.id;
        if (!id) {
            return handleError(new Error("Parâmetro id ausente"));
        }

        await dispositivoService.desativar(auth, id);
        return ok(null, "Dispositivo desativado com sucesso");
        } catch (error) {
        return handleError(error);
        }
    },
    regenerarToken: async (request: HttpRequest): Promise<HttpResponseInit> => {
        try {
        const auth = extractAuthContext(request);
        const token = extractToken(request);
        await checkPermission(token, auth.empresa_id, "dispositivo", "atualizar");

        const id = request.params.id;
        if (!id) {
            return handleError(new Error("Parâmetro id ausente"));
        }

        const result = await dispositivoService.regenerarToken(auth, id);
        return ok(result, "Token regenerado. Guarde o token — ele não será exibido novamente.");
        } catch (error) {
        return handleError(error);
        }
    },

}