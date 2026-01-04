# container

a container is a sandboxed process running on a host machine that is isolated from all other processes running on that host machine, that isolation leverages kernel namespaces and cgroupsopen_in_new, features that have been in Linux for a long time, Docker makes these capabilities approachable and easy to use

container is a runnable instance of an image, you can create, start, stop, move, or delete a container using the Docker API or CLI

container can be run on local machines, virtual machines, or deployed to the cloud

container is portable (and can be run on any OS), isolated from other containers and runs its own software, binaries, configurations, etc

# container command

```shell
# check container status
docker stats

# list container
#   -a  list all container
#   -l  list recently created container
#   -n [num]  list specify rows of container
#   -q  only list container id
docker container list

# run container, image is nginx:latest
#   --name [container name]
#   -p [server port]:[container port]  specify port
#   -P  random port
#   -d  run as a daemon in the background
docker container run --name my-nginx -p 80:80 -d nginx:latest
# run container and enter container by /bin/bash
#   -i  run in interactive mode
#   -t  run in specify terminal
# exit by `ctrl + d` or `exit` will stop the container
# exit by `ctrl + p + q` will not stop the container
docker container run -it nginx:latest /bin/bash

# enter container by the origin terminal
# exit by `ctrl + d` or `exit` will stop the container
docker container attach my-nignx

# enter container by a new terminal
# exit by `ctrl + d` or `exit` will not stop the container
docker container exec -it my-nginx /bin/bash

# enter the container as root user
docker container exec -u 0 -it my-nginx /bin/bash

# copy file from container
docker container cp my-nginx:/tmp/test.txt ./test.txt

# export container as an image
docker container export my-nginx > ./my-nginx.tar

# list logs
#   -f  list logs by following mode
docker container logs my-nginx

# start container
docker container start my-nginx

# stop container
docker container stop my-nginx

# restart container
docker container restart my-nginx

# delete container
# -f  force remove
docker container remove my-nginx

# force delete container
docker container kill my-nginx

# check container logs
docker container logs my-nginx

# check container internal process
docker container top my-nginx

# check container
docker container inspect my-nginx

# base on my-nginx, build extended  mirror image
docker container commit -m="add vim command" -a="harvey" my-nginx harvey/my-nginx:latest
```
