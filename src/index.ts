import { setServers } from "node:dns";
setServers(["8.8.8.8", "8.8.4.4"]);
// const nodemailer = require('nodemailer')
import nodemailer from "nodemailer"
import { Application, Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
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
        // await client.connect();
        const db = client.db('task-submit')
        const userCollection = db.collection('user')
        const taskSubmitCollection = db.collection('task')
        // reset start
        app.post('/forgot-password', async (req, res) => {
            console.log(req.body, 'from reset');
            const { email } = req.body;
            const user = await userCollection.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: "Email not found." });
            }

            // Generate a secure 6-digit numerical code
            const verificationCode = Math.floor(100000 + Math.random()).toString();

            // Save code and 15-minute expiry to MongoDB
            user.resetCode = verificationCode;
            user.resetCodeExpires = Date.now() + 15 * 60 * 1000;
            await user.save();

            // Configure your email transporter (e.g., SendGrid, Gmail, Mailtrap)
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS // Use an App Password, not your master password
                }
            });

            // Send email execution
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your Password Reset Verification Code',
                text: `Your password reset code is: ${verificationCode}. It expires in 15 minutes.`
            });

            res.status(200).json({ message: "Verification code sent to email." });

        });

        // getuser
        app.get('/api/getuser', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        // task
        app.post('/api/posttask', async (req, res) => {
            const corsur = req.body;
            console.log(corsur);
            const data = {
                ...corsur,
                date: new Date()
            }
            const result = await taskSubmitCollection.insertOne(data)
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
        app.delete('/api/deletetask/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id as string) }
            const result = await taskSubmitCollection.deleteOne(query)
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

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

// Export app for Vercel serverless
export default app