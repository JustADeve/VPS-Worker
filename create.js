const sleep = ms => new Promise(r => setTimeout(r, ms));
const shell = require('shelljs');

module.exports = async (job) => {
    var data = job.data;
    var id = job.id;

    console.log(`Creating ${id} with ${data.password} @ ${data.ip} -p ${data.sshPort}`, data);

    await job.updateProgress('Hello');

    var proxID = await shell.exec(`pvesh get /cluster/nextid`);
    console.log('p', proxID, proxID.stdout);
    if (proxID.code != 0) throw new Error(`${proxID.stderr}`);

    proxID = String(proxID.stdout).replace('\n', '');
    proxID = parseInt(proxID);

    await job.updateProgress(`Got proxmox ID: ${proxID}`);

    var vpsCreateRes = await shell.exec(getCreateCMD(proxID, data.ip, data.password, '/var/lib/vz/template/cache/debian-12-standard_12.2-1_amd64.tar.zst'));

    if (vpsCreateRes.stderr.length > 0) throw new Error(`${vpsCreateRes.stderr}`);

    await shell.exec('pct start ' + proxID);

    await job.updateProgress('Empty vps created');

    await shell.exec(`cp /etc/pve/firewall/100.fw /etc/pve/firewall/${proxID}.fw`);

    await job.updateProgress('Added firewall rules.');

    await shell.exec(`pct exec ${proxID} sh -- -c "echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config"`);

    await job.updateProgress('SSH enabled');

    await shell.exec(`pct exec ${proxID} sh -- -c "echo '\tFree VPS by BasementHost' > /etc/motd"`);

    await job.updateProgress('Motd clear');

    const fs = require('fs');

    // echo "iptables -t nat -A PREROUTING -p TCP --dport 3$(echo $ID)0 -j DNAT --to-destination $(echo $IP):22" >> $PN
    fs.writeFileSync(`/port/${data.portID}.sh`, `iptables -t nat -A PREROUTING -p TCP --dport ${sshPort} -j DNAT --to-destination ${ip}:22`);

    await shell.exec(`bash /port/${data.portID}.sh`);

    await job.updateProgress('Port forwarded!');

    await shell.exec('pct reboot ' + proxID);

    await job.updateProgress('VPS restarted!');

    data.proxID = proxID;
    data.ok = true;

    return data;
};

function getCreateCMD(id, ip, password, path) {
    // pct create $ID /var/lib/vz/template/cache/debian-12-standard_12.2-1_amd64.tar.zst --hostname=vps$ID --swap=4096 --memory=1024 --cmode=shell
    // --net0 name=eth0,bridge=vmbr0,firewall=1,gw=10.5.0.1,ip=$IP/16,rate=3 --ostype=debian --password $PASSWORD --start=1 --unprivileged=1 --cores=1
    // --features fuse=1,nesting=1,keyctl=1

    var cmd = '';
    cmd += 'pct create ';
    cmd += id;

    cmd += ` ${path} `
    cmd += `--hostname=vps${id} `;
    cmd += `--swap=4096 `;
    cmd += `--memory=2048 `;
    cmd += `--cmode=shell `;
    cmd += `--net0 name=eth0,bridge=vmbr0,firewall=1,gw=10.5.0.1,ip=${ip}/17,rate=3 `;
    cmd += `--ostype=debian `;
    cmd += `--password ${password}`;
    cmd += `--start=1 `;
    cmd += `--unprivileged=1 `;
    cmd += `--cores=1 `;
    cmd += `--features fuse=1,nesting=1,keyctl=1`;

    return cmd;
}