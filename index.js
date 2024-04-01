require('dotenv').config();

const BullMQ = require('bullmq');
const path = require('path');

const { NODE_LOCATION, NODE_TYPE, NODE_NUMBER } = process.env;
const { REDIS_HOST, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

const NodeID = `${NODE_LOCATION}-${String(NODE_TYPE)[0]}${NODE_NUMBER}`

const processorFile = path.join(__dirname, 'create.js');
const worker = new BullMQ.Worker(
    `${NodeID}_create`,
    processorFile,
    {
        connection: {
            host: REDIS_HOST,
            username: REDIS_USERNAME,
            password: REDIS_PASSWORD
        }
    }
);