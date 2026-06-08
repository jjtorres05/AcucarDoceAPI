import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { AuthContext,FiltroData } from "../types";
import { parseAndValidate } from "../middleware/validateBody";
import { criarLeituraSchema } from "../schemas/leituraSchema";
import { leituraService } from "../services/leituraService";
import { handleError,ok, created } from "../utils/httpResponse";
import { deobfuscateId } from "../utils/obfuscateId";
import { ValidationError } from "../utils/errors";

function extrairFiltroData(request: HttpRequest): FiltroData {
    const inicio = request.query.get("inicio");
    const fim = request.query.get("fim");
    if(!inicio || !fim){
        throw new ValidationError("Parametros inicio e fim sao obrigatorios para listar leituras");
    }
    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    if(isNaN(inicioDate.getTime()) || isNaN(fimDate.getTime())){
        throw new ValidationError("inicio e fim devem ser datas validas em formato ISO 8601");
    }
    return { inicio: inicioDate, fim: fimDate };
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

        // Buscar por ID nao precisa de filtro de data
        if(id){
            const result = await leituraService.obterPorId(auth,id);
            return ok(result);
        }

        // Para listados, inicio e fim sao obrigatorios
        const filtro = extrairFiltroData(request);
        const dispositivoId = request.query.get("dispositivoId");
        const sensorId = request.query.get("sensorId");

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
