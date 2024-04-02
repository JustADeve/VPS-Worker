const shell = require('shelljs');
const fs = require('fs');

async function addForward(ID, int, ext, ip) {
    // echo "iptables -t nat -A PREROUTING -p TCP --dport 3$(echo $ID)0 -j DNAT --to-destination $(echo $IP):22" >> $PN
    fs.writeFileSync(`/port/${ID}.sh`, `iptables -t nat -A PREROUTING -p TCP --dport ${ext} -j DNAT --to-destination ${ip}:${int}`);

    var a = await shell.exec(`bash /port/${ID}.sh`);
    console.log('a', a);
    return a;
}

module.exports = {
    addForward
}