const sleep = ms => new Promise(r => setTimeout(r, ms));
const shell = require('shelljs');
const lib = require('./lib');

module.exports = async (job) => {
    var data = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${data.password} @ ${data.ip} -p ${data.sshPort}`, data);

    await job.updateProgress('Hello');


    var vpsCreateRes = await shell.exec(getCreateCMD(proxID, data.ip, data.password, '/var/lib/vz/template/cache/alpine-3.19-default_20240207_amd64.tar.xz', data.storage, data));

    // console.log(vpsCreateRes);

    if (vpsCreateRes.stderr.length > 0) throw new Error(`Error: ${vpsCreateRes.stderr}`);

    // console.log((await shell.exec('pct start ' + proxID)).stderr);

    await job.updateProgress('Empty vps created');

    console.log((await shell.exec(`cp /etc/pve/firewall/100.fw /etc/pve/firewall/${proxID}.fw`)).stderr);

    await job.updateProgress('Added firewall rules.');

    await shell.exec(`pct exec ${proxID} sh -- -c "echo 'http://mirror.ertixnodes.xyz/alpine/v3.19/main' > /etc/apk/repositories"`);
    await shell.exec(`pct exec ${proxID} sh -- -c "echo 'http://mirror.ertixnodes.xyz/alpine/v3.19/community' >> /etc/apk/repositories"`);

    await shell.exec(`pct exec ${proxID} sh -- -c "apk update"`);
    await shell.exec(`pct exec ${proxID} sh -- -c "apk add openssh zsh git wget curl htop sudo bash htop neofetch"`);
    await shell.exec(`pct exec ${proxID} sh -- -c "echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config"`);
    // sed -i 's#/bin/ash#/bin/zsh#' /etc/passwd
     await shell.exec(`pct exec ${proxID} sh -- -c "rc-update add sshd"`);

    await shell.exec(`pct exec ${proxID} sh -- -c "echo '\tFree VPS by ErtixNodes.' > /etc/motd"`);
    await shell.exec(`pct exec ${proxID} sh -- -c "echo '\t' >> /etc/motd"`);
    await shell.exec(`pct exec ${proxID} sh -- -c "echo '\tPackage manager: apk' >> /etc/motd"`);
    await shell.exec(`pct exec ${proxID} sh -- -c "echo '\tYour vps ID: ${data.shortID}' >> /etc/motd"`);

    await shell.exec(`pct exec ${proxID} sh -- -c "bash <(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`);

    await shell.exec(`pct exec ${proxID} sh -- -c "sed -i 's#/bin/ash#/bin/zsh#' /etc/passwd"`);
    
    await shell.exec(`pct exec ${proxID} sh -- -c "wget https://raw.githubusercontent.com/ErtixNodes/Scripts/main/apt -O /bin/apt"`);
    await shell.exec(`pct exec ${proxID} sh -- -c "chmod 777 /bin/apt"`);

    await lib.addForward(data.portID, 22, data.sshPort, data.ip);

    await job.updateProgress('Port forwarded!');

    await shell.exec('pct reboot ' + proxID);

    await job.updateProgress('VPS restarted!');

    data.proxID = proxID;
    data.ok = true;

    return data;
};

function getCreateCMD(data) {
    // incus config device override ubuntu-vm root size=30GiB
    var name = `vps_${data.userID}_${data.shortID}`;
    var cmd = {};
    cmd.create = `incus launch images:alpine/3.19 ${name} -c limits.memory=1GB -c limits.cpu=1 -c limits.cpu.allowance=25% -c limits.processes=100`;
    cmd.storage = `incus config device override ${name} root size=10GiB`
    cmd.network = `incus config device override ${name} eth0 limits.max=10Mbit`;

    return cmd;
}
