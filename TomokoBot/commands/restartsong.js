module.exports.run = (message, args) => { // Command to restart the current song
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var repSong = guild.repeatSong;
            var repQueue = guild.repeatQueue;
            var shuf = guild.shuffle;
            guild.repeatSong = true;
            guild.repeatQueue = false;
            guild.shuffle = false;
            if (guild.connection.playing) {
                guild.connection.stopPlaying();
            } else if (guild.connection.paused) {
                guild.connection.resume();
                guild.connection.stopPlaying();
                guild.connection.pause();
            }
            guild.repeatQueue = repQueue;
            guild.repeatSong = repSong;
            guild.shuffle = shuf;
            bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player",
                                                    "description": "R-Restarted the current t-track!",
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
