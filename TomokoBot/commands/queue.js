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

module.exports.run = (message, args) => { // Command to list the current queue
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var queue = "";
            for (let i = 0; i < guild.queue.length; i++) {
                queue += (i + 1) + ". [" + guild.queue[i].title + "](" + guild.queue[i].ytUrl + ") (" + guild.queue[i].duration + ")\n";
            }
            if (queue.length >= 1920) {
                var msgCount = Math.ceil(queue.length / 1920);
                var messages = [];
                let j = 0;
                for (let g = 0; g < msgCount - 1; g++, j+= 1920) {
                    bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player: Queue",
                                                    "description": "Queue (Page " + (g+1) + " of " + msgCount + ")\n" + queue.substr(j, 1920),
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
                var repeatMode = "NoRepeat";
                if (guild.repeatQueue) {
                    repeatMode = "RepeatQueue";
                } else if (guild.repeatSong) {
                    repeatMode = "RepeatSong";
                }
                var shuffleMode = "NoShuffle";
                if (guild.shuffle) {
                    shuffleMode = "Shuffle";
                }
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player: Queue",
                                                    "description": "Queue (Page " + msgCount + " of " + msgCount + "):\n" + queue.substr(j) + "\nRepeat mode: `" + repeatMode + "`\nShuffle mode: `" + shuffleMode + "`",
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
                var repeatMode = "NoRepeat";
                if (guild.repeatQueue) {
                    repeatMode = "RepeatQueue";
                } else if (guild.repeatSong) {
                    repeatMode = "RepeatSong";
                }
                var shuffleMode = "NoShuffle";
                if (guild.shuffle) {
                    shuffleMode = "Shuffle";
                }
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player: Queue",
                                                    "description": "Queue:\n" + queue + "\nRepeat mode: `" + repeatMode + "`\nShuffle mode: `" + shuffleMode + "`",
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
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
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
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
