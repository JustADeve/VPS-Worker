ID=$1

pct create $ID /var/lib/vz/template/cache/debian-12-standard_12.2-1_amd64.tar.zst --hostname=vps$ID --swap=4096 --memory=1024 --cmode=shell --net0 name=eth0,bridge=vmbr0,firewall=1,gw=10.5.0.1,ip=$IP/16,rate=3 --ostype=debian --password $PASSWORD --start=1 --unprivileged=1 --cores=1 --features fuse=1,nesting=1,keyctl=1

echo Created

echo "Setting up firewall..."

cp /etc/pve/firewall/100.fw /etc/pve/firewall/$ID.fw

echo "Enabling ssh..."

#pct exec $ID sh -- -c "apt update"
#pct exec $ID sh -- -c "apk add bash"
#pct exec $ID sh -- -c "apk add openssh-server"
pct exec $ID sh -- -c "echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config"
#pct exec $ID sh -- -c "rc-update add sshd"

#pct exec $ID sh -- -c "apt update -y"
#pct exec $ID sh -- -c "apt install curl -y"
# pct exec $ID sh -- -c "curl "

pct exec $ID sh -- -c "echo '' > /etc/motd"

pct exec $ID sh -- -c "echo '##############################' >> /etc/motd"
pct exec $ID sh -- -c "echo '# Hosted by ErtixNodes       #' >> /etc/motd"
pct exec $ID sh -- -c "echo '# Free VPS Hosting           #' >> /etc/motd"
pct exec $ID sh -- -c "echo '#                            #' >> /etc/motd"
pct exec $ID sh -- -c "echo '# Your ad here?              #' >> /etc/motd"
pct exec $ID sh -- -c "echo '# Starting from \$1 per month #' >> /etc/motd"
pct exec $ID sh -- -c "echo '# DM BasToTheMax on discord  #' >> /etc/motd"
pct exec $ID sh -- -c "echo '##############################' >> /etc/motd"

pct exec $ID sh -- -c "echo '' >> /etc/motd"
pct exec $ID sh -- -c "echo 'If this is your first time using the vps:' >> /etc/motd"
pct exec $ID sh -- -c "echo 'Please execute /used code:$(echo $USED) in the discord server.' >> /etc/motd"

pct exec $ID sh -- -c "echo '' >> /etc/motd"
pct exec $ID sh -- -c "echo '' >> /etc/motd"
pct exec $ID sh -- -c "echo '' >> /etc/motd"
pct exec $ID sh -- -c "echo 'To get started: apt update -y' >> /etc/motd"
pct exec $ID sh -- -c "echo '> To install packages: apt install <package-name>' >> /etc/motd"
pct exec $ID sh -- -c "echo '' >> /etc/motd"
pct exec $ID sh -- -c "echo '' >> /etc/motd"
pct exec $ID sh -- -c "echo '' >> /etc/motd"

pct reboot $ID

PN="/ports/$(echo $ID).sh"

echo "# VM $ID" > $PN
echo "# SSH" >> $PN
echo "iptables -t nat -A PREROUTING -p TCP --dport 3$(echo $ID)0 -j DNAT --to-destination $(echo $IP):22" >> $PN
echo "# forward ports" >> $PN
for i in {1..9}
do
   echo "iptables -t nat -A PREROUTING -p TCP --dport 3$(echo $ID)$(echo $i) -j DNAT --to-destination $(echo $IP):3$(echo $ID)$(echo $i)" >> $PN
   echo "iptables -t nat -A PREROUTING -p UDP --dport 3$(echo $ID)$(echo $i) -j DNAT --to-destination $(echo $IP):3$(echo $ID)$(echo $i)" >> $PN
done

echo "echo forwarded ports for $(echo $ID)" >> $PN
echo "" >> $PN

echo "pct fstrim $ID" >> ../trim.sh

echo "Forwarding ports..."

# sleep 1

bash redo

# clear
echo "BTTM-Done"
# echo now redo bfport.sh