import { sensorRepository } from "../repositories/sensorRepository";
import { dispositivoRepository } from "../repositories/dispositvoRepository";
import { obfuscateId, deobfuscateId } from "../utils/obfuscateId";
import { NotFoundError } from "../utils/errors";
import { AuthContext,SensorResponse } from "../types";
import { criarSensorInput,atualizarSensorInput } from "../schemas/sensorSchema";

function toResponse(s:{
    id: number,
    dispositivo_id: number,
    nome_modelo: string,
    tipo_sensor: string,
    unidade: string,
    ativo: boolean,
    created_at: Date,
}): SensorResponse {
    return { 
        id: obfuscateId("sensor",s.id),
        dispositivo_id: obfuscateId("dispositivo",s.dispositivo_id),
        nome_modelo: s.nome_modelo,
        tipo_sensor: s.tipo_sensor,
        unidade: s.unidade,
        ativo: s.ativo,
        created_at: s.created_at
    };
}
export const sensorService={
    criar: async(
        auth: AuthContext,
        input: criarSensorInput
    ): Promise <SensorResponse> => {
        const dispositivoId= deobfuscateId("dispositivo",input.dispositivo_id);
        const dispositivo= await dispositivoRepository.findByIdAndEmpresa(dispositivoId, auth.empresa_id);
        if(!dispositivo){
            throw new NotFoundError("Dispositivo nao encontrado");
        }
        const sensor = await sensorRepository.create({
            dispositivo_id: dispositivoId,
            nome_modelo: input.nome_modelo,
            tipo_sensor: input.tipo_sensor,
            unidade: input.unidade,
        },
        auth.empresa_id,
        auth.usuario_id
        );
        return toResponse(sensor);
    },

    listarPorDispositivo: async(
        auth: AuthContext,
        obfuscatedDispositivoId: string
    ): Promise<SensorResponse[]> => {
        const dispositivoId= deobfuscateId("dispositivo",obfuscatedDispositivoId);
        const dispositivo= await dispositivoRepository.findByIdAndEmpresa(dispositivoId,auth.empresa_id);
        if(!dispositivo){
            throw new NotFoundError("Dispositivo nao encontrado");
        }

        const items= await sensorRepository.findAllByDispositivo(dispositivoId);
        return items.map(toResponse);
    },

    listarPorEmpresa: async(
        auth: AuthContext,
    ): Promise<SensorResponse[]>=>{
        const items= await sensorRepository.findAllByEmpresa(auth.empresa_id);
        return items.map(toResponse);
    },

    obterPorId: async(
        auth: AuthContext,
        obfuscatedId: string
    ):Promise<SensorResponse> =>{
        const id= deobfuscateId("sensor",obfuscatedId);
        const sensor= await sensorRepository.findByIdAndEmpresa(id,auth.empresa_id);
        if(!sensor){
            throw new NotFoundError("Sensor nao encontrado");
        }
        return toResponse(sensor);
    },

    atualizar: async(
        auth: AuthContext,
        obfuscatedId: string,
        input: atualizarSensorInput
    ): Promise<SensorResponse> => {
        const id= deobfuscateId("sensor",obfuscatedId);
        const sensor= await sensorRepository.update(
            id,
            auth.empresa_id,
            input,
            auth.usuario_id
        );
        if(!sensor){
            throw new NotFoundError("Sensor nao encontrado");
        }
        return toResponse(sensor);
    },

    desativar: async(
        auth: AuthContext,
        obfuscatedId: string
    ): Promise<void> =>{
        const id=deobfuscateId("sensor",obfuscatedId);
        await sensorRepository.deactivate(
            id,
            auth.empresa_id,
            auth.usuario_id,
        );
    },
};