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

module.exports.run = (message, args) => { // Command to control giveaways
    if (args.length === 3) {
        if (message.member.permissions.has("administrator")) {
            if (giveawayGuilds.has(message.member.guild.id)) {
                return "E-Error:\nA giveaway i-is already running o-on this s-server.\nP-Please w-wait until the r-running giveaway i-is done.";
            }
            var winRole = "";
            // check args
            if (message.roleMentions.length === 1) {
                winRole = message.roleMentions[0];
            } else {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
                return;
            }
            var time = parseInt(args[1], 10);
            if (isNaN(time)) {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
                return;
            }
            if (!(args[2] == "true" || args[2] == "false")) {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
                return;
            }
            // set timeout for ending the giveaway and evaluating the winner
            var endTimeout = setTimeout((arg) => {
                var guild = giveawayGuilds.get(arg);
                var winnerMember = guild.participants[Math.floor(Math.random() * guild.participants.length)];
                while (winnerMember.id == bot.user.id) {
                    winnerMember = guild.participants[Math.floor(Math.random() * guild.participants.length)];
                }
                if (guild.type === "role") {
                    winnerMember.addRole(guild.role);
                }
                var message = "";
                if (guild.mentionEveryone) {
                    message = ":tada: @everyone T-The giveaway i-is over! :tada:\nW-Winner is: " + winnerMember.mention + "!";
                } else {
                    message = ":tada: The g-giveaway is o-over! :tada:\nWinner i-is: " + winnerMember.mention + "!";
                }
                bot.createMessage(guild.channelId, message);
                giveawayGuilds.delete(arg);
            }, parseInt(args[1], 10) * 60 * 1000, message.member.guild.id);
            var startMessage = "";
            if ((args[2] == "true")) {
                startMessage = "@everyone A giveaway h-has b-been started!\nReact w-with :trophy: to t-this message to p-participate!";
            } else {
                startMessage = "A g-giveaway has been s-started!\nR-React with :trophy: t-to this message t-to participate!";
            }
            giveawayGuilds.set(message.member.guild.id, {
                "endTimeout": endTimeout,
                "type": "role",
                "role": winRole,
                "mentionEveryone": (args[2] == "true"),
                "participants": [],
                "channelId": message.channel.id,
                "startMessage": startMessage
            });
            return startMessage;
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
            return;
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
        return;
    }
};

module.exports.options = {
    "cooldown": 8000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4,
    "reactionButtons": [
        {
            emoji: "🏆",
            type: "edit",
            response: (message, args, userId) => {
                var guild = giveawayGuilds.get(message.member.guild.id);
                if (!guild)
                    return;
                var members = message.member.guild.members;
                var participant = members.find((object) => {
                    return object.id == userId;
                });
                guild.participants.push(participant);
            }
        }
    ],
    "reactionButtonTimeout": 3600000
};
