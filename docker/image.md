# image

a running container uses an isolated filesystem, this isolated filesystem is provided by an image

the image must contain everything needed to run an application - all dependencies, configurations, scripts, binaries, etc

the image also contains other configurations for the container, such as environment variables, a default command to run, and other metadata

# image command

```shell
# search image
docker search nginx

# list all images
#   -a  list all imgaes
#   -q  only list images id
docker image list
# shorthand
docker images

# pull latest version
docker image pull nginx
# pull specify version
docker image pull nginx:1.25.1

# delete image
#   -f  force delete
docker image remove nginx:latest
# delete image by id
docker image remove 18e5af790473
# delete multi images
docker image remove nginx:latest redis:latest mysql:latest
# delete all images
docker image remove $(docker images)

# export image to local
docker image save -o ./nginx.tar nginx:latest

# import local image
docker image load -i ./nginx.tar
docker image import ./nginx.tar

# create a target-tag refers to source-tag
# docker image tag [[version id] | [repository]:[tag]] [repository]:[tag]
docker image tag d55d2d2a0776 127.0.0.1:5000/my-nginx:latest

# list dangling image, both repository and tag of image are none is dangling image
docker image list -f dangling=true

# delete dangling image
docker image prune
```
