const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (job) => {
    console.log('j', job);

    var { ip, password, sshPort } = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${password} @ ${ip} -p ${sshPort}`);

    await sleep(30*1000);

    console.log('Created!');

    return {
        proxID: 300
    };
};