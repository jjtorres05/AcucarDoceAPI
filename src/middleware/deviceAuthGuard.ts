import { DeviceContext } from "../types";
import { UnauthorizedError, NotFoundError } from "../utils/errors";
import { verifyDeviceToken } from "../utils/deviceToken";
import { dispositivoRepository } from "../repositories/dispositvoRepository";
import { deobfuscateId } from "../utils/obfuscateId";

export async function extractDeviceContext(
    obfuscatedDispositivoId: string,
    tokenDispositivo: string,
    empresa_id: number
    ): Promise<DeviceContext> {
        const dispositivoId =  deobfuscateId("dispositivo",obfuscatedDispositivoId);

        const dispositivo = await dispositivoRepository.findWithHash(dispositivoId);
        if (!dispositivo) {
            throw new NotFoundError("Dispositivo não encontrado");
        }
        if(!dispositivo.ativo){
            throw new UnauthorizedError("Dispositivo inativo");
        }
        if(dispositivo.empresa_id !== empresa_id){
            throw new UnauthorizedError("Dispositivo nao pertence a esta empresa");
        }

        const tokenValido = await verifyDeviceToken(tokenDispositivo, dispositivo.token_dispositivo_hash);

        if (!tokenValido) {
            throw new UnauthorizedError("Token de dispositivo inválido");
        }

    return {
        dispositivo_id: dispositivo.id,
        empresa_id: dispositivo.empresa_id,
    };
}