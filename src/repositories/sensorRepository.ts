import { getPrismaClient } from "../database/prismaClient";
import { calcularAlteracoes, montarDescricaoLog } from "../utils/logHelper";
import { NotFoundError } from "../utils/errors";

const safeSelect={
    id: true,
    dispositivo_id: true,
    nome_modelo: true,
    tipo_sensor: true,
    unidade: true,
    ativo: true,
    created_at: true,
}as const;
export const sensorRepository={

    findByIdAndEmpresa: (id: number, empresa_id: number)=>
        getPrismaClient().sensor.findFirst({
            where: {id, dispositivo:{empresa_id},},select:safeSelect,
        }),

    findAllByDispositivo: (dispositivo_id:number)=>
        getPrismaClient().sensor.findMany({
            where: {dispositivo_id},
            select: safeSelect,
            orderBy: {created_at:"desc"},
        }),

    findAllByEmpresa: (empresa_id: number)=>
        getPrismaClient().sensor.findMany({
            where: {dispositivo: {empresa_id}},
            select: safeSelect,
            orderBy: {created_at: "desc"},
        }),

    create: (
        data:{
            dispositivo_id: number;
            nome_modelo: string;
            tipo_sensor: string;
            unidade: string;
        },
        empresa_id: number,
        executadoPorId: number
    )=>
        getPrismaClient().$transaction(async(tx)=>{
            const sensor = await tx.sensor.create({
                data,
                select: safeSelect,
            });
            await tx.log.create({
                data: {
                    tabela: "sensor",
                    operacao: "CREATE",
                    dispositivo_id: data.dispositivo_id,
                    dispositivo_nome: null,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "CREATE",
                        entidade: "sensor",
                        registroId: sensor.id,
                        executadoPor: executadoPorId,
                        dados:{
                            nome_modelo: sensor.nome_modelo,
                            tipo_sensor: sensor.tipo_sensor,
                            unidade: sensor.unidade,
                            dispositivo_id: sensor.dispositivo_id,
                        },
                    }),
                },
            });
            return sensor;
        }),
    update: (
        id: number,
        empresa_id:number,
        data: {nome_modelo?: string, tipo_sensor?: string, unidade?: string, ativo?: boolean},
        executadoPorId: number
    )=>
        getPrismaClient().$transaction(async (tx)=>{
            const antes= await tx.sensor.findFirst({
                where: {id, dispositivo:{empresa_id}}, select: safeSelect,
            });
            if(!antes) throw new NotFoundError("Dispositivo nao encontrado");
            const sensor = await tx.sensor.update({
                where: {id}, data, select: safeSelect,
            });
            const alteracoes = calcularAlteracoes(antes, sensor, data);
            await tx.log.create({
                data: {
                    tabela: "sensor",
                    operacao: "UPDATE",
                    dispositivo_id: sensor.dispositivo_id,
                    dispositivo_nome: null,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "UPDATE",
                        entidade: "sensor",
                        registroId: sensor.id,
                        executadoPor: executadoPorId,
                        alteracoes,
                    }),
                },
            });
            return sensor;
        }),
    deactivate: (id: number, empresa_id: number, executadoPorId: number)=>
        getPrismaClient().$transaction(async (tx)=>{
            const antes = await tx.sensor.findFirst({
                where: {id, dispositivo:{empresa_id}},
                select: safeSelect,
            });
            if(!antes) throw new NotFoundError("Sensor nao encontrado");
            const sensor = await tx.sensor.update({
                where:{id},
                data: {ativo: false},
                select: safeSelect,
            });
            const alteracoes = calcularAlteracoes(antes, sensor, {ativo: false});
            await tx.log.create({
                data: {
                    tabela: "sensor",
                    operacao: "DEACTIVATE",
                    dispositivo_id: sensor.dispositivo_id,
                    dispositivo_nome: null,
                    empresa_id,
                    descricao: montarDescricaoLog({
                        acao: "DEACTIVATE",
                        entidade: "sensor",
                        registroId: sensor.id,
                        executadoPor: executadoPorId,
                        alteracoes,
                    }),
                },
            });
        }),  
};