import zmq from 'zeromq';
import delay from 'delay';
import {format} from 'node:util'
import { generateTasks } from './generate-task.js';

const ALPHABETS = 'abcdefghijklmnopqrstuvwxyz';
const BATCH_SIZE = 10000;
const PORT = process.env.PORT || 5016;

const [,, maxLength, searchHash] = process.argv;

async function main() {
    const ventilator = new zmq.Push();
    await ventilator.bind(format('tcp://*:%d', PORT));
    await delay(1000);

    const generatorObj = generateTasks(searchHash, ALPHABETS, maxLength, BATCH_SIZE);

    for (const task of generatorObj) {
        await ventilator.send(JSON.stringify(task));
    }
}

main().catch(err => console.log(err));