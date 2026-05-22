import { get } from "http";
import { getPrismaClient } from "../database/prismaClient";
import { montarDescricaoLog } from "../utils/logHelper";
import { date } from "zod/v4";

const safeSelect={
    id:true,
    dispositivo_id: true,
    sensor_id: true,
    tipo: true,
    mensagem: true,
    created_at: true,
}as const;

export const alertaRepository = {
    findByIdAndEmpresa: (id: number, empresa_id: number) => 
        getPrismaClient().alerta.findFirst({
            where: {id, dispositivo: {empresa_id}}, select: safeSelect,orderBy:{created_at:"desc"},
        }),

    findAllByEmpresa: (empresa_id: number)=>
        getPrismaClient().alerta.findMany({
            where: {dispositivo:{empresa_id}}, select: safeSelect, orderBy:{created_at: "desc"},
        }),

    findAllByDispositivo: (dispositivo_id: number)=>
        getPrismaClient().alerta.findMany({
            where: {dispositivo_id}, select: safeSelect, orderBy: {created_at: "desc"},
        }),

    findAllBySensor: (sensor_id: number)=>
        getPrismaClient().alerta.findMany({
            where: {sensor_id}, select: safeSelect, orderBy: {created_at: "desc"},
        }),
    
    create: (
        data: {
            dispositivo_id: number;
            sensor_id: number;
            tipo: string;
            mensagem: string;
        },
        empresa_id: number,
        executadoPorId: number,
    )=> 
        getPrismaClient().$transaction(async (tx)=>{
            const dispositivo = await tx.dispositivo.findUnique({
                where: { id: data.dispositivo_id },  // o antes.dispositivo_id en update/deactivate
                select: { nome_modelo: true },
            });
            const alerta = await tx.alerta.create({
                data, select: safeSelect,
            });
            await tx.log.create({
                data: {
                    tabela: "alerta",
                    operacao: "CREATE",
                    dispositivo_id: data.dispositivo_id,
                    dispositivo_nome: dispositivo?.nome_modelo ?? null,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "CREATE",
                        entidade: alerta.tipo,
                        registroId: alerta.id,
                        executadoPor: executadoPorId,
                        dados: {
                            tipo: alerta.tipo,
                            mensagem: alerta.mensagem,
                            dispositivo_id: alerta.dispositivo_id,
                            sensor_id: alerta.sensor_id,
                        },
                    }),
                },
            });
            return alerta;
        }),
};
