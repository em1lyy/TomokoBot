module.exports.run = (message, args) => { // Command to set repeat state
    if (args.length === 1) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            if (args[0] === "queue") {
                guild.repeatSong = false;
                guild.repeatQueue = true;
            } else if (args[0] === "song") {
                guild.repeatSong = true;
                guild.repeatQueue = false;
            } else if (args[0] === "off") {
                guild.repeatSong = false;
                guild.repeatQueue = false;
            } else {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            }
            var repeatMode = "NoRepeat";
            if (guild.repeatQueue) {
                repeatMode = "RepeatQueue";
            } else if (guild.repeatSong) {
                repeatMode = "RepeatSong";
            }
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "Repeat m-mode: `" + repeatMode + "`",
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
    } else if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var repeatMode = "NoRepeat";
            if (guild.repeatQueue) {
                repeatMode = "RepeatQueue";
            } else if (guild.repeatSong) {
                repeatMode = "RepeatSong";
            }
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "R-Repeat mode: `" + repeatMode + "`",
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
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
