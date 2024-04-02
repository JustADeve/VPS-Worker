const shell = require('shelljs');

module.exports = async (job) => {

    var data = job.data;

    var returnData;
    returnData = data;

    returnData.ok = true;

    if (!data.action) throw new Error('No action');

    switch (data.action) {
        case "start":
            var id = data.proxID;
            await shell.exec(`pct start ${id}`);
            break;
        case "stop":
            var id = data.proxID;
            await shell.exec(`pct shutdown ${id}`);
            break;
        case "kill":
            var id = data.proxID;
            await shell.exec(`pct stop ${id}`);
            break;
        case "restart":
            var id = data.proxID;
            await shell.exec(`pct restart ${id}`);
            break;
        default:
            returnData.ok = false;
            returnData.error = 'invalid action';
    }

    return returnData;
};