#!/bin/bash

while true
do
	git pull
	/home/pi/.nvm/versions/node/v12.17.0/bin/npm update
	/home/pi/.nvm/versions/node/v12.17.0/bin/node ./TomokoBot.js
done
