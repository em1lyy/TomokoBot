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

module.exports.run = (message, args) => { // Command to get the avatar of an user
    if (args.length === 1) {
        if (message.mentionEveryone) {
            warnEveryone(message, message.author, message.content.split(" ")[0]);
            return;
        }
        if (message.mentions.length === 1) {
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Avatar for " + message.mentions[0].username + ":",
                                                "description": "[Avatar URL Link](" + message.mentions[0].avatarURL + ")",
                                                "color": 16684873,
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "image": {
                                                    "url": message.mentions[0].avatarURL
                                                },
                                                "footer": {
                                                    "icon_url": message.author.avatarURL,
                                                    "text": "Requested by: " + getUserName(message.member)
                                                }
                                            }
                                           }); // Send a message with the avatar as embed.
        } else if (args[0].startsWith("uid:")) {
            var userUID = args[0].split("uid:")[1];
            var userByUID = bot.users.find(user => user.id == userUID);
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Avatar for " + userByUID.username + ":",
                                                "description": "[Avatar URL Link](" + userByUID.avatarURL + ")",
                                                "color": 16684873,
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "image": {
                                                    "url": userByUID.avatarURL
                                                },
                                                "footer": {
                                                    "icon_url": message.author.avatarURL,
                                                    "text": "Requested by: " + getUserName(message.member)
                                                }
                                            }
                                           }); // Send a message with the avatar as embed.
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
            return;
        }
    } else {
        bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Avatar for " + message.author.username + ":",
                                            "description": "[Avatar URL Link](" + message.author.avatarURL + ")",
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "image": {
                                                "url": message.author.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                       }); // Send a message with the avatar as embed.
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
