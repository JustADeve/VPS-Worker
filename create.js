const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (job) => {
    console.log('j', job);

    var data = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${data.password} @ ${data.ip} -p ${data.sshPort}`);

    await job.updateProgress('step 1');

    data.proxID = 500;
    data.ok = true;

    return data;
};