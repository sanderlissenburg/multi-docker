docker build -t lissenburg/multi-docker-client:latest -t lissenburg/multi-docker-client:$GIT_SHA  -f ./client/Dockerfile ./client
docker build -t lissenburg/multi-docker-server:latest -t lissenburg/multi-docker-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t lissenburg/multi-docker-worker:latest -t lissenburg/multi-docker-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

docker push lissenburg/multi-docker-client
docker push lissenburg/multi-docker-server
docker push lissenburg/multi-docker-worker

kubectl apply -f k8s

kubectl set image deployment/client-deployment server=lissenburg/multi-docker-client:$GIT_SHA
kubectl set image deployment/server-deployment server=lissenburg/multi-docker-server:$GIT_SHA
kubectl set image deployment/worker-deployment server=lissenburg/multi-docker-worker:$GIT_SHA