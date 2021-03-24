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

module.exports.run = (message, args) => {
    if (!message.channel.guild)
        return "T-This command c-can only be used i-in a guild!";
    if (args.length === 1) {
        if (message.member.permissions.has("manageGuild")) {
            if (parseInt(args[0]) == NaN)
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            bot.pruneMembers(message.channel.guild.id, {
                "days": parseInt(args[0]),
                "reason": message.author.username
            });
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 45000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
