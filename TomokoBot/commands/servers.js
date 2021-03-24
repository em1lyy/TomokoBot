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

module.exports.run = (message, args) => { // Displays every server Tomoko is in.
    if (args.length === 0) {
        if (message.author.id === config.ownerId) {
            logInfo("Servers requested.");
            var guild = message.member.guild;
            var servers = "";
            bot.guilds.forEach((value, key, map) => {
                servers += value.name + "\n";
            });

            if (servers.length >= 1920) {
                var msgCount = Math.ceil(servers.length / 1920);
                var messages = [];
                let j = 0;
                for (let g = 0; g < msgCount - 1; g++, j+= 1920) {
                    bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Servers",
                                                    "description": "Servers (Page " + (g+1) + " of " + msgCount + ")\n" + servers.substr(j, 1920),
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
                }
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Servers",
                                                    "description": "Servers (Page " + msgCount + " of " + msgCount + "):\n" + servers.substr(j),
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });

            } else {
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Servers",
                                                    "description": "Servers:\n" + servers,
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
            }
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 30000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 3
};
