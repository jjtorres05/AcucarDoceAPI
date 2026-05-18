import { HttpRequest } from "@azure/functions";
import { DeviceContext } from "../types";
import { UnauthorizedError, NotFoundError } from "../utils/errors";
import { verifyDeviceToken } from "../utils/deviceToken";
import { dispositivoRepository } from "../repositories/dispositvoRepository";
import { deobfuscateId } from "../utils/obfuscateId";

export async function extractDeviceContext(
    request: HttpRequest
    ): Promise<DeviceContext> {
    const deviceToken = request.headers.get("x-device-token");
    if (!deviceToken) {
        throw new UnauthorizedError("Header x-device-token ausente");
    }

    const dispositivoIdObfuscated = request.headers.get("x-device-id");
    if (!dispositivoIdObfuscated) {
        throw new UnauthorizedError("Header x-device-id ausente");
    }

    const dispositivoId = deobfuscateId("dispositivo", dispositivoIdObfuscated);

    const dispositivo = await dispositivoRepository.findWithHash(dispositivoId);

    if (!dispositivo) {
        throw new NotFoundError("Dispositivo não encontrado");
    }

    if (!dispositivo.ativo) {
        throw new UnauthorizedError("Dispositivo inativo");
    }

    const isValid = await verifyDeviceToken(
        deviceToken,
        dispositivo.token_dispositivo_hash
    );

    if (!isValid) {
        throw new UnauthorizedError("Token de dispositivo inválido");
    }

    return {
        dispositivo_id: dispositivo.id,
        empresa_id: dispositivo.empresa_id,
    };
}