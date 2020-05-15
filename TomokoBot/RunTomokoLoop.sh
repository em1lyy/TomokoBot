#!/bin/bash

while true
do
	git pull
	/home/pi/.nvm/versions/node/v8.16.1/bin/npm update
	/home/pi/.nvm/versions/node/v8.16.1/bin/node ./TomokoBot.js
done
