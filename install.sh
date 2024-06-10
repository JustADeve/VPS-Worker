apt update -y

apt install -y htop wget curl sudo -y

mkdir -p /etc/apt/keyrings/

wget -O /etc/apt/keyrings/zabbly.asc https://pkgs.zabbly.com/key.asc

sh -c 'cat <<EOF > /etc/apt/sources.list.d/zabbly-incus-stable.sources
Enabled: yes
Types: deb
URIs: https://pkgs.zabbly.com/incus/stable
Suites: $(. /etc/os-release && echo ${VERSION_CODENAME})
Components: main
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/zabbly.asc

EOF'

apt-get update -y

apt-get install incus -y

clear

incus admin init --minimal

mkdir /data

incus storage create vps btrfs source=/data