import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { AuthContext,FiltroData } from "../types";
import { parseAndValidate } from "../middleware/validateBody";
import { criarLeituraSchema } from "../schemas/leituraSchema";
import { leituraService } from "../services/leituraService";
import { handleError,ok, created } from "../utils/httpResponse";
import { deobfuscateId } from "../utils/obfuscateId";

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
    criar: async (request: HttpRequest):
    Promise<HttpResponseInit> => {
        const dispositivoId = request.query.get("dispositivoId");
        if (!dispositivoId) {
            return handleError(new Error("Parametro dispositivoId ausente"));
        }
        const empresaId = request.query.get("empresaId");
        if (!empresaId) {
            return handleError(new Error("Parametro empresaId ausente"));
        }
        const empresa_id = deobfuscateId("empresa", empresaId);
        const input = await parseAndValidate(request, criarLeituraSchema);
        const result = await leituraService.criar(dispositivoId, empresa_id, input);
        return created(result, "Leitura criada com sucesso");
    },

    listar: async (request: HttpRequest, auth: AuthContext ):
    Promise <HttpResponseInit> => {
        const id = request.query.get("id");
        const dispositivoId = request.query.get("dispositivoId");
        const sensorId = request.query.get("sensorId");
        const filtro = extrairFiltroData(request);

        if(id){
            const result = await leituraService.obterPorId(auth,id);
            return ok(result);
        }
        if(sensorId){
            const result = await leituraService.listarPorSensor(auth, sensorId, filtro);
            return ok(result);
        }
        if(dispositivoId){
            const result = await leituraService.listarPorDispositivo(auth,dispositivoId, filtro);
            return ok(result);
        }
        const result = await leituraService.listarPorEmpresa(auth, filtro);
        return ok(result);
    },
};
