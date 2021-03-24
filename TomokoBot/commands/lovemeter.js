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

module.exports.run = (message, args) => { // LOVEMETER 3000 PRO 2.0
    if (message.mentionEveryone) {
        warnEveryone(message, message.author, message.content.split(" ")[0]);
        return;
    }
    var user1;
    var user2;
    if (message.mentions.length === 1) {
        user1 = message.author;
        user2 = message.mentions[0];
    } else if (message.mentions.length === 2) {
        user1 = message.mentions[0];
        user2 = message.mentions[1];
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
        return;
    }
    var love = 0;
    if (user1 == bot.user || user2 == bot.user) {
        if (user1.id === config.ownerId || user2.id === config.ownerId) {
            love = 100;
        } else {
            love = (user1.discriminator + user2.discriminator) % 101;
        }
    } else {
        love = (user1.discriminator + user2.discriminator) % 101;
    }
    var comment = "Oh, if you can see this, an error occured, lol.";
    if (love < 20) {
        comment = "Wow, you two should stay away from each other...";
    } else if (love < 40) {
        comment = "Not so good.";
    } else if (love < 60) {
        comment = "Kinda good, but far from perfect.";
    } else if (love < 90) {
        comment = "Pretty good, this could be worth a try.";
    } else if (love > 89) {
        comment = "A Real love!";
    }
    bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Ultra Love Meter 3000 Pro 2.0 Mega Edition :heart:",
                                            "description": "R-Result for " + user1.username + " a-and " + user2.username + ":\n" + love + "%! " + comment,
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                        }); // Send a message with the love meter result
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
