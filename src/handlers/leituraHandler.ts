import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { extractAuthContext } from "../middleware/authGuard";
import { parseAndValidate } from "../middleware/validateBody";
import { criarLeituraSchema } from "../schemas/leituraSchema";
import { leituraService } from "../services/leituraService";
import { handleError,ok, created } from "../utils/httpResponse";
import { FiltroData } from "../types";
import { request } from "http";

function extrairFiltroData(request: HttpRequest): FiltroData | undefined {
    const inicio = request.query.get("inicio");
    const fim = request.query.get("fim");
    if(!inicio && !fim) return undefined;

    return {
        inicio: inicio ? new Date(inicio) : undefined,
        fim: fim ? new Date(fim) : undefined,
    };
}

export const leituraHandler= {
    criar: async(request: HttpRequest ):
    Promise <HttpResponseInit> => {
        try {
            const empresaIdParam = request.params.empresaId;
            if (!empresaIdParam) {
                return handleError(new Error("Parametro empresaId faltando"));
            }
            const empresa_id = parseInt(empresaIdParam, 10);
            const dispositivoId= request.params.dispositivoId;
            if (!dispositivoId){
                return handleError(new Error ("Parametro dipositivoId faltando"));
            }
            const input = await parseAndValidate(request, criarLeituraSchema);
            const result = await leituraService.criar(dispositivoId,empresa_id, input);
            return created(result, "Leitura criada com sucesso");
        }catch (erro){
            return handleError(erro);
        }
    },

    listarPorEmpresa: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        try {
            const auth = extractAuthContext(request);
            const filtro = extrairFiltroData(request);
            const result = await leituraService.listarPorEmpresa(auth, filtro);
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
            const filtro = extrairFiltroData(request);
            const result = await leituraService.listarPorDispositivo(auth, dispositivoId, filtro);
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
            const filtro = extrairFiltroData(request);
            const result = await leituraService.listarPorSensor(auth, sensorId, filtro);
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
            const result = await leituraService.obterPorId(auth, id);
            return ok(result);
        } catch (erro) {
            return handleError(erro);
        }
    },
};
