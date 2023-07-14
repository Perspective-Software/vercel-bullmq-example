import {VercelRequest, VercelResponse} from "@vercel/node";
import {Queue} from "bullmq";
import IORedis from 'ioredis';

export default async function handleRequest(req: VercelRequest, res: VercelResponse): Promise<void> {

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        const REDIS_URL = process.env.REDIS_URL || '';
        if(!REDIS_URL) {
            res.status(400).send({success: false, message: 'Redis Configuration missing'}).end();
            return;
        }
        const connection = new IORedis(REDIS_URL);
        const queue = new Queue('vercel-example-queue', {connection});

        const job = await queue.add('example-job', { foo: 'bar' });

        res.status(200).send({success: job?.id}).end();
    }

    res.status(400).end();
}
