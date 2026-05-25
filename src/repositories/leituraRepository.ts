import { getMongoDb } from "../database/mongoClient";
import { ObjectId } from "mongodb";
import { FiltroData } from "../types";
import { buildFiltroData } from "../utils/filtroData";

const COLLECTION = "leituras";


export const leituraRepository= {
    create: async (data:{
        dispositivo_id: number;
        sensor_id: number;
        empresa_id: number;
        valor: number;
        unidade: string;
    })=> {
        const db = await getMongoDb();
        const documento = {
            ...data,
            created_at: new Date(),
        };
        const result = await db.collection(COLLECTION).insertOne(documento);
        return {_id: result.insertedId,...documento};
    },
    
    finndByIdAndEmpresa: async (id: string, empresa_id: number)=> {
        const db = await getMongoDb();
        return db.collection(COLLECTION).findOne({
            _id: new ObjectId(id),
            empresa_id,
        });
    },

    findAllByEmpresa: async(empresa_id: number,filtro?: FiltroData)=> {
        const db = await getMongoDb();
        return db.collection(COLLECTION)
        .find({empresa_id, ...buildFiltroData(filtro)})
        .sort({created_at: -1}).toArray();
    },

    findAllByDispositivo: async(dispositivo_id: number,empresa_id: number, filtro?:FiltroData)=> {
        const db = await getMongoDb();
        return db.collection(COLLECTION)
        .find({dispositivo_id, empresa_id, ...buildFiltroData(filtro)})
        .sort({created_at: -1}).toArray();
    },

    findAllBySensor: async(sensor_id: number, empresa_id: number, filtro?: FiltroData)=> {
        const db = await getMongoDb();
        return db.collection(COLLECTION)
        .find({sensor_id, empresa_id, ...buildFiltroData(filtro)})
        .sort({created_at: -1}).toArray();
    }
        


}