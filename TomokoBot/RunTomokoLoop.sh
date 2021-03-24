#!/bin/bash

###
# This file is part of Tomoko, a Discord Bot for
# moderation, fun, levels, music and much more!
# Copyright (C) 2018-2021 Emily <elishikawa@jagudev.net>
#
# Tomoko is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Tomoko.  If not, see <https://www.gnu.org/licenses/>.
###

while true
do
	git pull
	/home/pi/.nvm/versions/node/v12.17.0/bin/npm update
	/home/pi/.nvm/versions/node/v12.17.0/bin/node ./TomokoBot.js
done
