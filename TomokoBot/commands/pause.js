module.exports.run = (message, args) => {  // Command to pause/resume
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            if (!guild.connection.paused) {
                guild.connection.pause();
                bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": ":play_pause: " + message.member.mention + ", audio h-has b-been paused!",
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
                guild.connection.resume();
                bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": ":play_pause: " + message.member.mention + ", a-audio has been r-resumed!",
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
