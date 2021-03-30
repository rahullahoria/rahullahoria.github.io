#!/bin/bash
# sh release.sh pwr 0.01

#mogiio/pwr-users:v0.01

echo "envirnment: $1"
echo "current version: $2"

bump=0.01
#newVersion=$(($2 + $bump))
newVersion=`echo $2 + $bump | bc`
oldimage="mogiio/pwr-users:v$2"
image="mogiio/pwr-users:v$newVersion"

docker build -t $image .
docker push $image

cat kube-setup-$1.yaml | sed "s|${oldimage}|${image}|g" > kube-setup-$1-1.yaml; mv -f kube-setup-$1-1.yaml kube-setup-$1.yaml
git commit -a -m $image
git pull
git push https://rahullahoria:redhat123789@github.com/rahullahoria/rahullahoria.github.io.git/

kubectl apply -f kube-setup-$1.yaml