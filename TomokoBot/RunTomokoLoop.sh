#!/bin/bash

while true
do
	git pull
	npm update
	node ./TomokoBot.js
done
