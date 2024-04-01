const sleep = ms => new Promise(r => setTimeout(r, ms));
const shell = require('shelljs');

module.exports = async (job) => {
    var data = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${data.password} @ ${data.ip} -p ${data.sshPort}`, data);

    await job.updateProgress('Hello');

    var proxID = await shell.exec(`pvesh get /cluster/nextid`);
    console.log('p', proxID);

    data.proxID = 500;
    data.ok = true;

    return data;
};