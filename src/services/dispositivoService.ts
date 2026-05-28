import { dispositivoRepository } from "../repositories/dispositvoRepository";
import { generateDeviceToken,hashDeviceToken } from "../utils/deviceToken";
import { obfuscateId, deobfuscateId } from "../utils/obfuscateId";
import { NotFoundError } from "../utils/errors";
import { AuthContext, DispositivoResponse, DispositivoCreateResponse, PaginatedResponse } from "../types";
import { CriarDispositivoInput, AtualizarDispositivoInput } from "../schemas/dispositivoSchema";
import { date } from "zod/v4";

function toResponse(d:{
    id: number,
    nome_modelo: string,
    ativo: boolean,
    created_at: Date;
}):DispositivoResponse {
    return{
        id: obfuscateId("dispositivo",d.id),
        nome_modelo: d.nome_modelo,
        ativo: d.ativo,
        created_at: d.created_at,
    };
}

export const dispositivoService = {
    criar: async (
        auth: AuthContext,
        input: CriarDispositivoInput
    ): Promise<DispositivoCreateResponse> => {
        const tokenOriginal = generateDeviceToken();
        const tokenHash= await hashDeviceToken(tokenOriginal);
        const dispositivo = await dispositivoRepository.create(
            {
                empresa_id: auth.empresa_id,
                nome_modelo: input.nome_modelo,
                token_dispositivo_hash: tokenHash,
            },
            auth.usuario_id
        );
        return {
            ...toResponse(dispositivo),
            token_dispositivo: tokenOriginal,
        };
    },

    listar: async(auth: AuthContext):
    Promise<DispositivoResponse[]>=>{
        const items= await dispositivoRepository.findAllByEmpresa(auth.empresa_id);
        return items.map(toResponse);
    },
    
    obTerPorId: async(
        auth: AuthContext,
        obFuscatedId: string
    ): Promise<DispositivoResponse>=>{
        const id= deobfuscateId("dispositivo", obFuscatedId);
        const dispositivo = await dispositivoRepository.findByIdAndEmpresa(
            id,
            auth.empresa_id
        );
        if(!dispositivo){
            throw new NotFoundError("Dispositivo nao encontrado");
        }
        return toResponse(dispositivo);
    },

    atualizar: async (
        auth: AuthContext,
        input: AtualizarDispositivoInput
    ): Promise <DispositivoResponse>=>{
        const id = deobfuscateId("dispositivo",input.id);
        const {id:_,...data}= input;
        const dispositivo = await dispositivoRepository.update(
            id,
            auth.empresa_id,
            data,
            auth.usuario_id
        );
        if (!dispositivo){
            throw new NotFoundError("Dispositivo nao encontrado");
        }
        return toResponse(dispositivo);
    },
    desativar: async (
        auth: AuthContext,
        obfuscatedId: string,
    ): Promise<void> => {
        const id = deobfuscateId("dispositivo",obfuscatedId);
        await dispositivoRepository.deactivate(
            id,
            auth.empresa_id,
            auth.usuario_id
        );
    },
    regenerarToken: async(
        auth: AuthContext,
        obfuscatedId: string
    ): Promise <{token_dispositivo: string}>=>{
        const id= deobfuscateId("dispositivo",obfuscatedId);
        const tokenOriginal = generateDeviceToken();
        const tokenHash = await hashDeviceToken(tokenOriginal);

        await dispositivoRepository.updateTokenHash(
            id,
            auth.empresa_id,
            tokenHash,
            auth.usuario_id
        );
        return {token_dispositivo: tokenOriginal};
    },
    deletar: async(
        auth: AuthContext,
        obfuscatedId: string
    ): Promise<void> => {
        const id = deobfuscateId("dispositivo",obfuscatedId);
        await dispositivoRepository.delete(id,auth.empresa_id, auth.usuario_id);
    },
};