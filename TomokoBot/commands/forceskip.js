module.exports.run = (message, args) => { // Command to force skip the current song (requires channels.manage permission)
    if (args.length === 0) {
        if (message.member.permission.has("manageChannels")) {
            if (musicGuilds.has(message.member.guild.id)) {
                var guild = musicGuilds.get(message.member.guild.id);
                if (guild.connection.playing) {
                    guild.connection.stopPlaying();
                } else if (guild.connection.paused) {
                    guild.connection.resume();
                    guild.connection.stopPlaying();
                    guild.connection.pause();
                }
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "S-Skipped the current t-track!",
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
            noPermission(message, message.author, message.content.split(" ")[0]);
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
