#!/bin/sh

podman-compose \
    --file=podman-compose.yml \
    --in-pod PresenteProfessor \
    up \
    --build \
    --remove-orphans \
    --quiet-pull \
    --detach \
    PresenteProfessor
