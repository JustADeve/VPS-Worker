module.exports = async (job) => {
    console.log('j', job);

    var { ip, password, sshPort } = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${password} @ ${ip} -p ${sshPort}`);
};