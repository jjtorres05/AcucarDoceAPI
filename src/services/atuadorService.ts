import { atuadorRepository } from "../repositories/atuadorRepository";
import { dispositivoRepository } from "../repositories/dispositvoRepository";
import { obfuscateId, deobfuscateId } from "../utils/obfuscateId";
import { NotFoundError } from "../utils/errors";
import { AuthContext, AtuadorResponse, SensorResponse } from "../types";
import { CriarAtuadorInput, AtualizarAtuadorInput } from "../schemas/atuadorSchema";
import { atualizarSensorInput } from "../schemas/sensorSchema";

function toResponse(a:{
    id: number,
    dispositivo_id: number,
    nome_modelo: string,
    tipo: string,
    ativo: boolean,
    created_at: Date,
}): AtuadorResponse{
    return{
        id: obfuscateId("atuador",a.id),
        dispositivo_id: obfuscateId("dispositivo",a.dispositivo_id),
        nome_modelo: a.nome_modelo,
        tipo: a.tipo,
        ativo: a.ativo,
        created_at: a.created_at,
    };
}

export const atuadorService={
    criar: async(
        auth: AuthContext,
        input: CriarAtuadorInput
    ): Promise<AtuadorResponse> =>{
        const dispositivoId= deobfuscateId("dispositivo",input.dispositivo_id);
        const dispositivo= await dispositivoRepository.findByIdAndEmpresa(dispositivoId,auth.empresa_id);
        if(!dispositivo){
            throw new NotFoundError("Dispositivo nao encontrdo");
        }
        const atuador = await atuadorRepository.create({
            dispositivo_id: dispositivoId,
            nome_modelo: input.nome_modelo,
            tipo: input.tipo,
        },
        auth.empresa_id,
        auth.usuario_id
        );
        return toResponse(atuador);
    },

    listarPorDispositivo: async(
        auth: AuthContext,
        obfuscatedDispositivoId: string,
    ): Promise<AtuadorResponse[]>=> {
        const dispositivoId= deobfuscateId("dispositivo", obfuscatedDispositivoId);
        const dispositivo= await dispositivoRepository.findByIdAndEmpresa(dispositivoId,auth.empresa_id);
        if(!dispositivo){
            throw new NotFoundError("Dispositivo nao encontrado");
        }
        const items= await atuadorRepository.findAllByDispositivo(dispositivoId);
        return items.map(toResponse);
    },

    listarPorEmpresa: async(
        auth: AuthContext,
    ): Promise <AtuadorResponse[]> => {
        const items = await atuadorRepository.findAllByEmpresa(auth.empresa_id);
        return items.map(toResponse);
    },

    obterPorId: async(
        auth: AuthContext,
        obfuscatedId: string
    ): Promise<AtuadorResponse> => {
        const id= deobfuscateId("atuador",obfuscatedId);
        const atuador = await atuadorRepository.findByIdAndEmpresa(id,auth.empresa_id);
        if(!atuador){
            throw new NotFoundError("Atuador nao encontrado");
        }
        return toResponse(atuador);
    },

    atualizar: async(
        auth: AuthContext,
        input: atualizarSensorInput
    ): Promise<AtuadorResponse> => {
        const id= deobfuscateId("atuador",input.id);
        const {id:_,...data}= input;
        const atuador= await atuadorRepository.update(
            id,
            auth.empresa_id,
            data,
            auth.usuario_id
        )
        if(!atuador){
            throw new NotFoundError("Atuador nao encontrado");
        }
        return toResponse(atuador);
    },

    desativar: async(
        auth: AuthContext,
        obfuscatedId: string
    ): Promise<void> => {
        const id= deobfuscateId("atuador", obfuscatedId);
        await atuadorRepository.deactivate(
            id,
            auth.empresa_id,
            auth.usuario_id,
        );
    },

    deletar: async(
        auth: AuthContext,
        obfuscatedId: string,
    ): Promise<void> => {
        const id = deobfuscateId("atuador", obfuscatedId);
        await atuadorRepository.delete(id, auth.empresa_id, auth.usuario_id);
    },
};