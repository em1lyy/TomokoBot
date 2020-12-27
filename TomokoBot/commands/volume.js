module.exports.run = (message, args) => { // Volume command
    if (args.length === 1) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var volume = parseFloat(args[0]);
            if (!isNaN(volume)) {
                guild.connection.setVolume(volume);
                bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's Music Player",
                                                            "description": "V-Volume s-set to `" + guild.connection.volume + "`",
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
                invalidArgs(message, message.author, message.content.split(" ")[0]);
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
