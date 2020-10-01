module.exports.run = (message, args) => {
    if (args.length === 0) {
        refreshUptime(); // Refresh the Uptime variables
        var guildsInCurrentShard = 0;
        bot.guilds.forEach((guild) => { // Calcutale guild count for message author's shard
            if(guild.shard.id === message.member.guild.shard.id) {
                guildsInCurrentShard++;
            }
        });
        var musicStatus = "**not playing** any music.";
        if (musicGuilds.has(message.member.guild.id)) {
            musicStatus = "playing **" + musicGuilds.get(message.member.guild.id).queue[0].title + "**.";
        }
        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Status",
                                                    "description": "O-Oh, you want some i-information about m-my current status?\nO-Okay, h-here you go:",
                                                    "color": 16684873,
                                                    "footer": {
                                                        "icon_url": message.author.avatarURL,
                                                        "text": "Requested by: " + getUserName(message.member)
                                                    },
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "fields": [
                                                        {
                                                            "name": ":clock3: Uptime",
                                                            "value": "**" + uptimeH + "** hour(s), **" + uptimeM + "** minute(s) and **" + uptimeS + "** second(s)."
                                                        },
                                                        {
                                                            "name": ":desktop: Current Version",
                                                            "value": "I am currently running **Version " + pkg.version + "**."
                                                        },
                                                        {
                                                            "name": ":earth_africa: Global Analytics",
                                                            "value": "Guilds: **" + bot.guilds.size + "**\nShards: **" + bot.shards.size + "**\nUsers: **" + bot.users.size + "**",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":diamond_shape_with_a_dot_inside: This Shard Analytics",
                                                            "value": "Guilds: **" + guildsInCurrentShard + "**\nShard ID: **" + message.member.guild.shard.id + "**\nUsers: **" + message.member.guild.memberCount + "**",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":speaker: Music Status",
                                                            "value": "I am currently " + musicStatus
                                                        },
                                                        {
                                                            "name": ":floppy_disk: RAM Usage",
                                                            "value": "**" + (Math.round(process.memoryUsage().rss / 1024 /1024)) + "** MB",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":floppy_disk: Heap Usage",
                                                            "value": "**" + (Math.round(process.memoryUsage().heapUsed / 1024 / 1024)) + "** MB / **" + (Math.round(process.memoryUsage().heapTotal / 1024 / 1024)) + "** MB",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":thumbsup: Like me?",
                                                            "value": "O-Oh, y-you like m-me? M-Me? Oh, i-if you r-really do s-so, y-you can v-vote for me at [Discord Bot List](https://discordbots.org/)."
                                                        },
                                                        {
                                                            "name": ":handshake: Support",
                                                            "value": "If you need Support, please join [my Discord Server](https://discord.gg/EK9F28B)"
                                                        }
                                                    ]
                                                }
                                            });
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 5000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
