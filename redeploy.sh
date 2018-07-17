cd /home/ec2-user/src/izin
git pull
docker build -t vladsynkov/izin .
docker rm -f izin
docker run -p 3000:3000 -d --name izin vladsynkov/izin
docker ps -a


# sshaws "sh /home/ec2-user/src/izin/redeploy.sh"
