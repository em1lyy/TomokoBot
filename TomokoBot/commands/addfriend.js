/**
 * This file is part of Tomoko, a Discord Bot for
 * moderation, fun, levels, music and much more!
 * Copyright (C) 2018-2021 Emily <elishikawa@jagudev.net>
 *
 * Tomoko is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Tomoko.  If not, see <https://www.gnu.org/licenses/>.
**/

module.exports.run = (message, args) => { // Command that was initially though to add a friend, but sadly doesn't work
    if (args.length === 1) {
        if (message.author.id === config.ownerId) {
            logInfo("Sending friend request to <@!" + args[0] + "> .");
            bot.addRelationship(args[0], false);
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 12000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 3
};
