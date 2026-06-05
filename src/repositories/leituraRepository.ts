import { getMongoDb } from "../database/mongoClient";
import { FiltroData } from "../types";
import { ConflictError } from "../utils/errors";
import { buildFiltroData } from "../utils/filtroData";

const COLLECTION = "leituras";

export const leituraRepository= {
    // internamente faz isso::timestamp >= (agora - 1 segundo)
    create: async (data:{
        dispositivo_id: number;
        sensor_id: number;
        empresa_id: number;
        valor: number;
    })=> {
        const db = await getMongoDb();
        const agora = new Date();
        const duplicada= await db.collection(COLLECTION).findOne({
            "metadata.sensor_id": data.sensor_id,
            "metadata.empresa_id": data.empresa_id,
            valor: data.valor,
            timestamp: agora,
        });
        if(duplicada){
            throw new ConflictError("Leitura duplicada");
        }
        const documento = {
            timestamp: agora,
            metadata: {
                dispositivo_id: data.dispositivo_id,
                sensor_id: data.sensor_id,
                empresa_id: data.empresa_id,
            },
            valor: data.valor,
        };
        const result = await db.collection(COLLECTION).insertOne(documento);
        return {_id: result.insertedId,...documento};
    },

    findByIdAndEmpresa: async (id: string, empresa_id: number)=> {
        const db = await getMongoDb();
        const { ObjectId } = await import("mongodb");
        return db.collection(COLLECTION).findOne({
            _id: new ObjectId(id),
            "metadata.empresa_id": empresa_id,
        });
    },

    findAllByEmpresa: async(empresa_id: number,filtro?: FiltroData)=> {
        const db = await getMongoDb();
        return db.collection(COLLECTION)
        .find({"metadata.empresa_id": empresa_id, ...buildFiltroData(filtro)})
        .sort({timestamp: -1}).toArray();
    },

    findAllByDispositivo: async(dispositivo_id: number,empresa_id: number, filtro?:FiltroData)=> {
        const db = await getMongoDb();
        return db.collection(COLLECTION)
        .find({"metadata.dispositivo_id": dispositivo_id, "metadata.empresa_id": empresa_id, ...buildFiltroData(filtro)})
        .sort({timestamp: -1}).toArray();
    },

    findAllBySensor: async(sensor_id: number, empresa_id: number, filtro?: FiltroData)=> {
        const db = await getMongoDb();
        return db.collection(COLLECTION)
        .find({"metadata.sensor_id": sensor_id, "metadata.empresa_id": empresa_id, ...buildFiltroData(filtro)})
        .sort({timestamp: -1}).toArray();
    }


}
