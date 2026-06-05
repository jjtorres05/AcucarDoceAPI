import { MongoClient, Db } from "mongodb";

let client: MongoClient | undefined;
let db: Db | undefined;

export async function getMongoDb(): Promise<Db>{
    if(!db){
        const url= process.env.MONGODB_URL;
        if(!url){
            throw new Error("MONGODB_URL nao esta definida");
        }
        client = new MongoClient(url);
        await client.connect();
        db= client.db("acucar_doce");
        await ensureTimeSeriesCollection(db);
    }
    return db;
}

async function ensureTimeSeriesCollection(database: Db): Promise<void>{
    const collections = await database.listCollections({name: "leituras"}).toArray();
    if(collections.length === 0){
        await database.createCollection("leituras",{
            timeseries:{
                timeField: "timestamp",
                metaField: "metadata",
                granularity: "seconds",
            },
        });
    }
}

export async function closeMongoConnection():Promise<void>{
    if (client){
        await client.close();
        client= undefined;
        db= undefined;
    }
}