import {VercelRequest, VercelResponse} from "@vercel/node";
import Bull from 'bull';
import {Queue} from "bullmq";

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_USERNAME = process.env.REDIS_USERNAME || '';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

export default async function handleRequest(req: VercelRequest, res: VercelResponse): Promise<void> {

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        new Bull('vercel-bull', REDIS_URL);
        if (!REDIS_URL || !REDIS_HOST || !REDIS_PORT || !REDIS_USERNAME || !REDIS_PASSWORD) {
            res.status(400).send({success: false, message: 'Redis Configuration missing'}).end();
            return;
        }
        const queue = new Queue('vercel-example-queue', {
            connection: {
                host: REDIS_HOST,
                port: REDIS_PORT,
                username: REDIS_USERNAME,
                password: REDIS_PASSWORD,
            }
        });

        const job = await queue.add('example-job', {foo: 'bar'});

        res.status(200).send({success: job?.id}).end();
    }

    res.status(400).end();
}
