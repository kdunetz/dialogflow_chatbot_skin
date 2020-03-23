#!/bin/bash

#IMAGE=kdunetz/kevin-new-chatbot:1.0
#NAME=kevin-new-chatbot

if [ -z "$IMAGE" ]
then
   echo "Please set environment variables with . ./setenv.sh"  
   exit
fi

docker build -f docker/Dockerfile -t $IMAGE .
docker push $IMAGE 
