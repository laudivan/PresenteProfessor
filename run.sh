#!/bin/sh

SECRET_NAME="PresenteProfessorPassword"

if ! podman secret inspect "$SECRET_NAME" >/dev/null 2>&1; then
    read -p "Enter password: " -r PASSWORD
    echo $PASSWORD | sha256sum | podman secret create "$SECRET_NAME" -
    echo -n "Password created successfully."
fi

podman-compose \
    --file=podman-compose.yml \
    --in-pod PresenteProfessor \
    up \
    --build --no-cache \
    --remove-orphans \
    --quiet-pull \
    --detach \
    PresenteProfessor
