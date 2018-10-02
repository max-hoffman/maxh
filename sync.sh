source ./env.sh
rsync -azP public/ ssh $MAXH_EC2_PATH:/home/ubuntu/maxh/public