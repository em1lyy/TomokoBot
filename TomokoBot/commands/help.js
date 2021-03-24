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

module.exports.run = (message, args) => { // Help command
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": help.help.title,
                                                    "description": help.help.description,
                                                    "color": 16684873,
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "footer": {
                                                        "icon_url": message.author.avatarURL,
                                                        "text": "75 commands, Requested by: " + getUserName(message.member)
                                                    },
                                                    "fields": help.help.fields
                                                }
        });
    } else if (args.length === 1) {
        if (!(help.commandsWithHelp.includes(args[0]))) {
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "No Help Available!",
                                                "description": "No h-help for command `" + args[0] + "` f-found!",
                                                "color": 16684873,
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                "footer": {
                                                    "icon_url": message.author.avatarURL,
                                                    "text": "Requested by: " + getUserName(message.member)
                                                }
                                            }
                                           }); // Send a "no help available" message.
            return;
        }
        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": help.help.title,
                                                    "description": "Help for command: `" + args[0] + "`",
                                                    "color": 16684873,
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "footer": {
                                                        "icon_url": message.author.avatarURL,
                                                        "text": "Requested by: " + getUserName(message.member)
                                                    },
                                                    "fields": [
                                                        {
                                                            "name": ":keyboard: Usage",
                                                            "value": "`" + help.commands[args[0]].usage + "`"
                                                        },
                                                        {
                                                            "name": ":pencil: Description",
                                                            "value": help.commands[args[0]].description
                                                        }
                                                    ]
                                                }
        });
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
