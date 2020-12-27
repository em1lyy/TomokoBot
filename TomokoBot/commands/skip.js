module.exports.run = (message, args) => { // Command to skip the current song
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
            if (musicGuilds.has(message.member.guild.id)) {
                var guild = musicGuilds.get(message.member.guild.id); // Skip emoticon: :track_next:
                if (guild.skipVotes > 0) {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's Music Player",
                                                            "description": "A s-skip voting h-has already b-been started!",
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
                guild.requiredSkipVotes = Math.ceil((bot.getChannel(guild.channelID)).voiceMembers.size / 2);
                if (guild.requiredSkipVotes >= 98) {
                    guild.requiredSkipVotes = 98;
                }
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "S-Skip voting s-started!\nP-Please react w-with :track_next: to v-vote!\nV-Votes till skip: `" + (guild.requiredSkipVotes + 1) + "`\n(Vote will e-end in 30 s-seconds!)",
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
                return "Votes required to skip: " + (guild.requiredSkipVotes + 1);
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
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4,
    "reactionButtons": [ // Add reaction buttons to the command
        {
            "emoji": "⏭",
            "type": "edit",
            "response": (message, args, userID) => { // Process the reaction
                message.getReaction("⏭", 100).then((votesArr) => {
                    var votes = votesArr.length;
                    var guild = musicGuilds.get(message.member.guild.id);
                    if (votes >= (guild.requiredSkipVotes + 1)) {
                        if (guild.connection.playing) {
                            guild.connection.stopPlaying();
                        } else if (guild.connection.paused) {
                            guild.connection.resume();
                            guild.connection.stopPlaying();
                            guild.connection.pause();
                        }
                        guild.skipVotes = 0;
                        guild.requiredSkipVotes = 1;
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
                    }
                });

                return "Votes required to skip: " + (guild.requiredSkipVotes + 1);
            },
            "filter": (msg, emoji, userID) => { return true; }
        }
    ],
    "reactionButtonTimeout": 30000
};
