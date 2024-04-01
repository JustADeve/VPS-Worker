const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (job) => {
    console.log('j', job);

    var { ip, password, sshPort } = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${password} @ ${ip} -p ${sshPort}`);

    await sleep(3*1000);
    await job.updateProgress('step 1');

    await sleep(3*1000);
    await job.updateProgress('step 2');

    await sleep(5*1000);
    await job.updateProgress('step 3');

    console.log('Created!');

    return {
        proxID: 300
    };
};