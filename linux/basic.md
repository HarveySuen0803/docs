# basic

```shell
# check current os version
lsb_release -a

getconf LONG_BIT

poweroff

reboot
```

# shortcuts

- control + c: termina programming
- control + d: close connection
- control + r: search history command

# which

```shell 
# find the store location of nvim command
which nvim
```

# find

```shell
# find "test" file in ./ dir
find "test"

# find "test.txt" file in ./ dir
find ./ -name "test.txt"

# find with wildcard
find ./ -name "test.*"
find ./ -name "*.txt"

# find with size
find ./ -size +100M
find ./ -size -100K
```

# ls

```shell
ls -al
ls -la

ls s*

ls -lR /bin
```

# echo

```shell
# output to shell
echo "hello world"

# not output the trailing newline
echo -n "hello world"

# output command
echo "pwd" # pwd
echo `pwd` # /home/harvey/Downloads

# output variable
msg="hello world"
echo $msg # hello world
echo '$msg' # $msg
echo "$msg" # hello world

# output with ESC
echo -e "hello \n world"
echo -e "hello \t world"

# over write
echo "hello world" > ./test.txt

# append write
echo "hello world" >> ./test.txt
```

# cp

```shell
cp ./test1.txt ./test2.txt

cp -r ./tes1 ./test2
```

# touch

```shell
touch ./test1.txt

touch ./test1.txt ./test2.txt ./test3.txt
```

# mkdir

```shell
mkdir ./test1/test2/test3

mkdir -p ./test1/test2/test3
```

# cat

```shell
cat ./test.txt

# output with line number
cat -n ./test.xt
```

# head

```shell
# output the first two lines
head -2 ./test.txt
```

# tail

```shell
# output the last two lines
tail -2 ./test.txt

# real-time output the file content
tail -f ./test.txt
```

# more

```shell
more ./test.txt
```

# grep

```shell
# search "hello" in test.txt file
grep "hello" ./test.txt

# search "hello" in test dir
grep -r "hello" ./test

# search file contain "hello" in test dir
grep -lr "hello" ./test

grep -lr "hello" ./test

# output with line number
grep -n "hello" ./test.txt

# ignore case
grep -i "hello" ./test.txt

# accurate search
grep -w "hello" ./test.txt

# search with RegExp
grep -E "hello|world" ./test.txt

grep -lr
```

# wc

```shell
wc ./test.txt

# count byte
wc -c ./test.txt

# count line
wc -l ./test.txt

# count word
wc -w ./test.txt
```

# !

```shell
# search n* command in history
!n

# search to* command in history
!to
```

# |

```shell
cat ./test.txt | grep "hello"

ls -l /usr/bin | grep "vim"

cat ./test.txt | wc -l

ls -l /usr/bin | wc -l
```

# tar

```shell
# compress ./test to ./test.tar
tar -cf ./test.tar ./test

# decompress ./test.tar
tar -xf ./test.tar

# compress ./test to ./test.tar.gz
tar -zcf ./test.tar.gz ./test

# decompress ./test.tar.gz
tar -zxf ./test.tar.gz

# compress ./test to ./test.tar.gz with details
tar -zcvf ./test.tar.gz ./test

# decompress ./test.tar.gz with details
tar -zxvf ./test.tar.gz
```

# zip

```shell
zip ./test.zip ./test

zip ./test.zip ./test/*

# compress file in ./test
zip -r ./test.zip ./test

unzip ./test.zip

# compress ./test.zip to ./test
unzip ./test.zip -d ./test

# check file in ./test.zip
unzip -v ./test.zip
```

# gzip

```shell
# compress ./test.txt to ./test.txt.gz, and delete the ./test.txt
gzip ./test.txt

gunzip ./test.txt.gz

# decompress ./test.txt.gz, similar to gunzip
gzip -d ./test.txt.gz

# check detail
gzip -l ./test.txt

# force compress ./test.txt
gzip -f ./test.txt

# compress ./test.txt with detail
gzip -v ./test.txt
 
# check compressed file content
zcat ./test.txt
```

# kill

```shell
kill -9 pid
```

# unzip

```shell
unzip test.zip

# unzip to my-dir dir
unzip -d my-dir test.zip

# do not overwrite existing file
unzip -n test.zip

# list file
unzip -l test.zip

# check compression ratio
unzip -v test.zip

# check if it is damaged
unzip -t test.zip
```

# history

```shell
history

# switch to 1700 command
!1700 
```

# apt

```shell
apt update

apt upgrade

apt install vim

apt install –reinstall vim

apt remove vim

apt check

apt clean

apt autoremove

apt source vim

apt show vim

apt list vim
```

# yum

```shell
yum list

yum check-update

yun update

yum install vim

yum update vim

yum remove vim

yum search vim

yum clean packages

yum clean headers

yum clean oldheaders
```

# systemctl

```shell
systemctl

systemctl | grep ufw.service

systemctl status ufw

systemctl start ufw

systemctl stop ufw

# auto launch
systemctl enable ufw

systemctl disable ufw
```

# ln

```shell
# link source file to target file
ln -s ./.config/nvim/init.lua ./init.lua

ln -s ./.config/nvim ./nvim
```

# date

```shell
date

date "+%Y.%m.%d %H:%M:%S"

date -d "+1 year"

date -d "+1 month"

date -d "+1 day"

date -d "+1 hour"

date -d "+1 minute"

date -d "+1 second"
```

# ps

```shell
ps -ef 

ps -aux

ps -ef | grep nginx

ps -aux | grep nginx
```

# ssh

```shell
ssh -p 22 harvey@192.168.10.11
```

# scp

download file

```shell
# download /home/harvey/test.xt to ./
scp -P 22 harvey@192.168.10.11:/home/harvey/test.txt ./
```

upload file

```shell
# upload ./test.txt to /home/harvey/
scp -P 22 ./test.txt harvey@192.168.10.11:/home/harvey/
```

# ftp

connect to ftp server

```shell
ftp 192.168.10.11
```

download file

```shell
get test.txt
```

set vsftpd config (file. /etc/vsftpd.conf)

```shell
write_enable=YES
# anon_mkdir_write_enable=YES
```

upload file

```shell
put test.txt
```

# wget

```shell
# download 
wget https://github.com/wbthomason/packer.nvim

# save as packer.nvim
wget -0 packer.nvim https://github.com/wbthomason/packer.nvim

# resume from breakpoint
wget -c https://github.com/wbthomason/packer.nvim

# donwload in background
wget -b https://github.com/wbthomason/packer.nvim

# check log
tail -f wget-log
```

# curl

```shell
# send request
curl https://github.com/wbthomason/packer.nvim

# download
curl -O https://github.com/wbthomason/packer.nvim

# download and save as packer.nvim
curl -o packer.nvim https://github.com/wbthomason/packer.nvim

curl -LJO packer.nvim https://github.com/wbthomason/packer.nvim

# return page
curl www.google.com

# return request header
curl -I www.google.com

# set `www.baidu.com` as referer
curl -e "www.baidu.com" -I http://127.0.0.1
```

# kill

```shell
# normal close process
kill -15 6379

# force close
kill -9 6379
```

# ufw

```shell
sudo ufw status

# show firewall status as numbered list of rules
sudo ufw status numbered

# show verbose firewall status
sudo ufw status verbose

sudo ufw enable

sudo ufw disable

sudo ufw reload

# allow rule
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 9000:9010/tcp
sudo ufw allow 9000:9010/udp
sudo ufw allow from 192.168.10.11
sudo ufw allow from 192.168.10.0/24
sudo ufw allow proto tcp to any port 80
sudo ufw allow from 192.168.10.11 proto tcp to any port 80

# deny rule
sudo ufw deny from 192.168.10.11
sudo ufw deny from 192.168.10.0/24
sudo ufw deny from 192.168.10.11 proto tcp to any port 80

# delete rule
sudo ufw delete 3
sudo ufw delete allow ssh
sudo ufw delete allow 80
```

# network

set network (file. /etc/netplan/00-installer-config.yaml)

```shell
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    enp0s5:
      dhcp4: no
      dhcp6: no
      addresses: # ip
        - 192.168.10.10/24
      routes: # gateway
        - to: default
          via: 192.168.10.1
      nameservers:
        addresses: # DNS
          - 8.8.8.8
          - 114.114.114.114
```

restart network

```shell
netplan apply
```

if it does not work

- disable firewall
- disable NetworkManager service
- restart the Parallels Desktop

# lsof

```shell
# check process on port 6379
lsof -i:6379

# show ipv4
lsof -i4:6379

# show ipv6
lsof -i6:6379
```

# netstat

```shell
# check process on port 6379
netstat -anp | grep 6379
```

# nmap

```shell
# check local exposed port
nmap 127.0.0.1
```

# disk partition

```shell
# check disk status
df -T
```

# hostname

check hostname

```shell
hostnamectl
```

set hostname

```shell
sudo hostnamectl set-hostname "hadoop100"
```

set hosts for Linux (file. /etc/hosts)

```
192.168.10.10 hadoop100
192.168.10.11 hadoop101
192.168.10.12 hadoop102
192.168.10.13 hadoop103
```

set hosts for MacOS (file. /etc/hosts)

```
192.168.10.10 hadoop100
192.168.10.11 hadoop101
192.168.10.12 hadoop102
192.168.10.13 hadoop103
```

# user

```shell
# check all user (file. /etc/passwd)
getent passwd

# check specify user
id harvey

useradd harvey

# specify group, specify home dir
useradd harvey -g project-dev -d /home/harvey

userdel harvey

# delete with home dir
userdel -r harvey

# add harvey to project-dev group
usermod -aG project-dev harvey
```

# user group

```shell
# check all group (file. /etc/group)
getent group

# check current group members
groups

groupadd project-dev

groupdel project-dev
```

# switch user

```shell
# switch to harvey
su harvey

# switch to root
sudo -s
```

# user permission

set root permission to normal user (file. /etc/sudoers)

```shell
harvey   ALL=(ALL:ALL) ALL
```

use sudo command without password (file. /etc/sudoers)

```shell
root    ALL=(ALL:ALL) NOPASSWD:ALL
%admin ALL=(ALL) NOPASSWD:ALL
%sudo   ALL=(ALL:ALL) NOPASSWD:ALL
```

# chmod

```python
chmod u=rwx,g=rw,o=r ./test.txt

chmod -R u=rwx,g=rw,o=r ./test

chmod 751 ./test.txt

chmod -R 751 ./test
```

# chown

```shell
chown harvey:project-dev test.txt

chown harvey test.txt

chown :project-dev test.txt

chown -R harvey:project-dev test.txt
```

# modify timezone by manual

```shell
rm /etc/localtime

ln -s /home/parallels/Temp/Shanghai /etc/localtime
```

# modify timezone by ntp

install ntp

```shell
apt install ntp
```

reload ntpd

```shell
systemctl reload ntp.service
```

check ntp server

```shell
ntpq -p
```