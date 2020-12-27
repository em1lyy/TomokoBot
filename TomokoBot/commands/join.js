module.exports.run = (message, args) => { // Makes Tomoko join the current vc
    if (args.length === 0) {
        if(!message.channel.guild) { // Check if the message was sent in a guild
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "T-This command c-can only be run in a s-server!",
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
            return;
        }
        if(!message.member.voiceState.channelID) { // Check if the user is in a voice channel
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "Y-You need to be i-in a voice channel t-to run this c-command!",
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
            return;
        }
        bot.joinVoiceChannel(message.member.voiceState.channelID).catch((err) => { // Join the user's voice channel
            bot.createMessage(message.channel.id, ":x: Error joining voice channel: " + err.message); // Notify the user if there is an error
            logError(err, message.member.guild.shard.id); // Log the error
        }).then((connection) => {
            if(connection.playing) { // Stop playing if the connection is playing something
                connection.stopPlaying();
            }
            connection.setVolume(1.0);
            connection.on("end", (msg) => {
                let daguild = musicGuilds.get(message.member.guild.id);
                let indexx = 0;
                if (daguild.shuffle) {
                    let trackId = Math.floor(Math.random() * daguild.queue.length); // Generate a random number
                    indexx = trackId;
                }
                if (daguild.repeatQueue) {
                    daguild.queue.push(daguild.queue[indexx]);
                }
                if (!daguild.repeatSong) {
                    daguild.queue.splice(indexx, 1);
                }
                if (daguild.queue.length > 0) {
                    bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": ":loud_sound: N-Now playing: **" + daguild.queue[indexx].title + "**",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": daguild.queue[indexx].thumbnail
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
                    daguild.connection.play(daguild.queue[indexx].url);
                } else {
                    if(daguild.connection.playing) { // Stop playing if the connection is playing something
                        daguild.connection.stopPlaying();
                    }
                    bot.leaveVoiceChannel(daguild.channelID);
                    musicGuilds.delete(message.member.guild.id);
                    bot.createMessage(daguild.textChannelId, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "F-Finished playing t-the queue, " + getUserName(message.member) + "!\nI hope i-it wasn't t-too bad...",
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
            });
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "I-I'm now in your v-voice channel, " + getUserName(message.member) + "!\nP-Please remember that I'll l-leave the channel w-when you don't u-use any m-music functions within the next m-minute!",
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
            var leaveTimeout = setTimeout((arg) => {
                logger.info(arg);
                var guild = musicGuilds.get(arg);
                if(guild.connection.playing) { // Stop playing if the connection is playing something
                    guild.connection.stopPlaying();
                }
                bot.leaveVoiceChannel(guild.channelID);
                bot.createMessage(guild.textChannelId, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player",
                                                    "description": "I-I'm no l-longer in your v-voice channel, " + getUserName(message.member) + "!\nD-Don't leave m-me alone again, okay?",
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
                musicGuilds.delete(arg);
            }, 60000, message.member.guild.id);
            musicGuilds.set(message.member.guild.id, {
                "channelID": message.member.voiceState.channelID,
                "connection": connection,
                "queue": [],
                "firstSong": true,
                "shardId": message.member.guild.shard.id,
                "textChannelId": message.channel.id,
                "repeatSong": false,
                "repeatQueue": false,
                "shuffle": false,
                "skipVotes": 0,
                "requiredSkipVotes": 1,
                "leaveCountdown": leaveTimeout
            });
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
