#!/bin/bash

if [ -z "$IMAGE" ]
then
   echo "Please set environment variables with . ./setenv.sh"  
   exit
fi

IMAGE=${IMAGE//[\/]/\\\/}
kubectl delete -f <(cat deploy_and_service.yml | sed "s/IMAGE/$IMAGE/g" | sed "s/NAME/$NAME/g") -n $NAMESPACE
