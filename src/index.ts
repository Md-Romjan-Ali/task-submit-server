import { setServers } from "node:dns";
setServers(["8.8.8.8", "8.8.4.4"]);

import { Application, Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
const app: Application = express()
const PORT = process.env.PORT || 5000

dotenv.config();
app.use(cors());
app.use(express.json())

const uri = process.env.MONGODB_URI as string
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db('task-submit')
        const taskSubmitCollection = db.collection('task')
        // task
        app.post('/api/posttask', async (req, res) => {
            const corsur = req.body;
            console.log(corsur);
            const result = await taskSubmitCollection.insertOne(corsur)
            res.send(result)
        })
        app.get('/api/getsubmit', async (req, res) => {
            const result = await taskSubmitCollection.find().toArray()
            res.send(result)
        })
        app.get('/api/getsubmitbyemail', async (req: Request, res: Response) => {
            const query: {
                email?: string
            } = {}
            if (typeof req.query.email === 'string') {
                query.email = req.query.email;
            }
            const result = await taskSubmitCollection.find(query).toArray()
            res.send(result)
        })
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hellow world')
})
app.listen(PORT, () => {
    console.log('this isdder side')
})