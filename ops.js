const shell = require('shelljs');
const lib = require('./lib');

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
            await shell.exec(`pct reboot ${id}`);
            break;
        case "forward":
            /* {
                action: 'forward',
                proxID: VPS.proxID,
                ip: VPS.ip,
                port: sshPort.port,
                intPort: port,
                userID: interaction.user.id
            }  */
            var id = data.proxID;
            var extPort = data.port;
            var pID = data.portID;
            var ip = data.ip;
            var intPort = data.intPort;

            await lib.addForward(pID, intPort, extPort, ip);
            break;
        case "remforward":
            /* {
                action: 'forward',
                proxID: VPS.proxID,
                ip: VPS.ip,
                port: sshPort.port,
                intPort: port,
                userID: interaction.user.id
            }  */
            var id = data.proxID;
            var extPort = data.port;
            var pID = data.portID;
            var ip = data.ip;
            var intPort = data.intPort;

            await lib.removeForward(pID, intPort, extPort, ip);
            break;
        default:
            returnData.ok = false;
            returnData.error = 'invalid action';
    }

    return returnData;
};