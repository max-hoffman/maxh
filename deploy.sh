source ./env.sh
hugo --theme=basics --buildDrafts && rsync -avz --delete public/ $MAXH_EC2_PATH:/home/ubuntu/maxh/public/
exit 0