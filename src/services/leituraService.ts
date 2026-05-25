import { leituraRepository } from "../repositories/leituraRepository";
import { sensorRepository } from "../repositories/sensorRepository";
import { extractDeviceContext } from "../middleware/deviceAuthGuard";
import { obfuscateId, deobfuscateId } from "../utils/obfuscateId";
import { NotFoundError } from "../utils/errors";
import { AuthContext, LeituraResponse, FiltroData } from "../types";
import { CriarLeituraInput } from "../schemas/leituraSchema";
import { ObjectId } from "mongodb";

function toResponse(l:{
    _id: ObjectId,
    dispositivo_id: number,
    sensor_id: number,
    valor: number,
    unidade: string,
    created_at: Date,
}): LeituraResponse {
    return {
        id: l._id.toHexString(),
        dispositivo_id: obfuscateId("dispositivo",l.dispositivo_id),
        sensor_id: obfuscateId("sensor",l.sensor_id),
        valor: l.valor,
        unidade: l.unidade,
        created_at: l.created_at
    };
}

export const leituraService={

    criar: async(
        obfuscatedDispositivoId: string,
        empresa_id: number,
        input: CriarLeituraInput
    ): Promise <LeituraResponse> => {
        const device = await extractDeviceContext(
            obfuscatedDispositivoId,
            input.token_dispostivo,
            empresa_id
        );
        const sensorId = deobfuscateId("sensor",input.sensor_id);
        const sensor = await sensorRepository.findByIdAndEmpresa(sensorId, empresa_id);
        if(!sensor){
            throw new NotFoundError("Sensor nao encontrado");
        }
        const leitura = await leituraRepository.create({
            dispositivo_id: device.dispositivo_id,
            sensor_id: sensorId,
            empresa_id: device.empresa_id,
            valor: input.valor,
            unidade: input.unidade,
        });
        return toResponse(leitura);
    },

    listarPorEmpresa: async(
        auth: AuthContext,
        filtro?: FiltroData
    ): Promise <LeituraResponse[]>=> {
        const items= await leituraRepository.findAllByEmpresa(auth.empresa_id, filtro);
        return items.map((l)=> toResponse(l as any));
    },

    listarPorDispositivo: async(
        auth: AuthContext,
        obfuscatedDispositivoId: string,
        filtro?: FiltroData
    ): Promise<LeituraResponse[]>=> {
        const dispositivoId= deobfuscateId("dispositivo", obfuscatedDispositivoId);
        const items= await leituraRepository.findAllByDispositivo(dispositivoId, auth.empresa_id, filtro);
        return items.map((l)=> toResponse(l as any));
    },

    listarPorSensor: async(
        auth: AuthContext,
        obfuscatedSensorId: string,
        filtro?: FiltroData
    ): Promise<LeituraResponse[]>=> {
        const sensorId= deobfuscateId("sensor", obfuscatedSensorId);
        const items= await leituraRepository.findAllBySensor(sensorId, auth.empresa_id, filtro);
        return items.map((l)=> toResponse(l as any));
    },

    obterPorId: async(
        auth: AuthContext,
        id: string
    ): Promise<LeituraResponse>=> {
        const leitura = await leituraRepository.finndByIdAndEmpresa(id,auth.empresa_id);
        if(!leitura){
            throw new NotFoundError("Leitura nao encontrada");
        }
        return toResponse(leitura as any);
    },
};