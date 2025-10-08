#!/bin/bash

uglifyjs ./src/hc.js -o ./dist/hc.min.js -c -m

printf "\nDone! (build)\n"
