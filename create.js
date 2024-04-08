const sleep = ms => new Promise(r => setTimeout(r, ms));
const shell = require('shelljs');
const lib = require('./lib');

module.exports = async (job) => {
    var data = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${data.password} @ ${data.ip} -p ${data.sshPort}`, data);

    await job.updateProgress('Hello');

    var proxID = await shell.exec(`pvesh get /cluster/nextid`);
    // console.log('p', proxID, proxID.stdout);
    if (proxID.code != 0) throw new Error(`${proxID.stderr}`);

    proxID = String(proxID.stdout).replace('\n', '');
    proxID = parseInt(proxID);

    await job.updateProgress(`Got proxmox ID: ${proxID}`);

    var vpsCreateRes = await shell.exec(getCreateCMD(proxID, data.ip, data.password, '/var/lib/vz/template/cache/debian-12-standard_12.2-1_amd64.tar.zst', data.storage, data));

    // console.log(vpsCreateRes);

    if (vpsCreateRes.stderr.length > 0) throw new Error(`Error: ${vpsCreateRes.stderr}`);

    // console.log((await shell.exec('pct start ' + proxID)).stderr);

    await job.updateProgress('Empty vps created');

    console.log((await shell.exec(`cp /etc/pve/firewall/100.fw /etc/pve/firewall/${proxID}.fw`)).stderr);

    await job.updateProgress('Added firewall rules.');

    await shell.exec(`pct exec ${proxID} sh -- -c "echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config"`);

    await job.updateProgress('SSH enabled');

    await shell.exec(`pct exec ${proxID} sh -- -c "echo '\tFree VPS by BasementHost' > /etc/motd"`);

    await job.updateProgress('Motd clear');


    await lib.addForward(data.portID, 22, data.sshPort, data.ip);

    await job.updateProgress('Port forwarded!');

    await shell.exec('pct reboot ' + proxID);

    await job.updateProgress('VPS restarted!');

    try {
    await shell.exec('pct exec ' + proxID + ' -- apt update -y && apt install sudo curl wget -y');
    } catch(e) {
        console.log('failed to update package', String(e))
    }

    await job.updateProgress('Packages updated!');

    data.proxID = proxID;
    data.ok = true;

    return data;
};

function getCreateCMD(id, ip, password, path, storage, data) {
    // pct create $ID /var/lib/vz/template/cache/debian-12-standard_12.2-1_amd64.tar.zst --hostname=vps$ID --swap=4096 --memory=1024 --cmode=shell
    // --net0 name=eth0,bridge=vmbr0,firewall=1,gw=10.5.0.1,ip=$IP/16,rate=3 --ostype=debian --password $PASSWORD --start=1 --unprivileged=1 --cores=1
    // --features fuse=1,nesting=1,keyctl=1

    var cmd = '';
    cmd += 'pct create ';
    cmd += id;

    cmd += ` ${path} `
    cmd += `--swap=256 `;
    if (data.type == 'normal') {
        cmd += `--hostname=vps${id} `;
        cmd += `--memory=2048 `;
    } else {
        cmd += `--hostname=test${id} `;
        cmd += `--memory=4096 `;
    }
    cmd += `--cmode=shell `;
    cmd += `--net0 name=eth0,bridge=vmbr0,firewall=1,gw=10.5.0.1,ip=${ip}/16,rate=3 `;
    cmd += `--ostype=debian `;
    cmd += `--password ${password} `;
    cmd += `--start=1 `;
    cmd += `--unprivileged=1 `;
    cmd += `--cores=1 `;
    cmd += `--features fuse=1,nesting=1,keyctl=1 `;
    cmd += `--rootfs ${storage}:5`;

    return cmd;
}