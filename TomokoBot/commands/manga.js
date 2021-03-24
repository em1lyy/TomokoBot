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

module.exports.run = (message, args) => { // Command to get info about a manga
    if (args.length >= 1) {
        if (/^\d+$/.test(args[0])) {
            if (args.length == 1) {
                AniList.media.manga(parseInt(args[0])).then((data) => {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's AniList Search",
                                                            "description": "Search Result f-for \"" + args[0] + "\"",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": data.coverImage.large
                                                            },
                                                            "fields": [
                                                                { "name": "Title", "value": data.title.english + " // " + data.title.romaji, "inline": true },
                                                                { "name": "ID", "value": data.id, "inline": true },
                                                                { "name": "Format", "value": data.format, "inline": true },
                                                                { "name": "Volumes", "value": ((data.volumes) ? data.volumes : "Releasing"), "inline": true },
                                                                { "name": "Chapters", "value": ((data.chapters) ? data.chapters : "Releasing"), "inline": true },
                                                                { "name": "Average Score", "value": ((data.averageScore) ? data.averageScore + "%" : "Unrated"), "inline": true },
                                                                { "name": "Description", "value": data.description.replace(/<br>/gm, '').replace(/<.?i>/gm, '*').replace(/<.?b>/gm, '**').substring(0, 1024) }
                                                            ],
                                                            "author": {
                                                                "name": "Tomoko Bot",
                                                                "icon_url": bot.user.avatarURL
                                                            },
                                                            "footer": {
                                                                "icon_url": message.author.avatarURL,
                                                                "text": "Requested by: " + getUserName(message.member)
                                                            }
                                                        }
                                                    });
                });
            } else {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            var searchQuery = args.join(" ");
            AniList.search("manga", searchQuery, 1, 1).then(searchRes => {
                var aniId = searchRes.media[0].id;
                AniList.media.manga(aniId).then((data) => {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's AniList Search",
                                                            "description": "Search R-Result for \"" + args.join(" ") + "\"",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": data.coverImage.large
                                                            },
                                                            "fields": [
                                                                { "name": "Title", "value": data.title.english + " // " + data.title.romaji, "inline": true },
                                                                { "name": "ID", "value": data.id, "inline": true },
                                                                { "name": "Format", "value": data.format, "inline": true },
                                                                { "name": "Volumes", "value": ((data.volumes) ? data.volumes : "Releasing"), "inline": true },
                                                                { "name": "Chapters", "value": ((data.chapters) ? data.chapters : "Releasing"), "inline": true },
                                                                { "name": "Average Score", "value": ((data.averageScore) ? data.averageScore + "%" : "Unrated"), "inline": true },
                                                                { "name": "Description", "value": data.description.replace(/<br>/gm, '').replace(/<.?i>/gm, '*').replace(/<.?b>/gm, '**').substring(0, 1024) }
                                                            ],
                                                            "author": {
                                                                "name": "Tomoko Bot",
                                                                "icon_url": bot.user.avatarURL
                                                            },
                                                            "footer": {
                                                                "icon_url": message.author.avatarURL,
                                                                "text": "Requested by: " + getUserName(message.member)
                                                            }
                                                        }
                                                    });
                });
            });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
