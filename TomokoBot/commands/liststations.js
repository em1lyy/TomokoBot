module.exports.run = (message, args) => { // Command to list Tomoko's radio stations
    if (args.length === 0) {
        var stationList = "";
        var i = 1;
        for (let station of radio.radioStations) {
            stationList += (i) + ". [" + station.queueObject.title + "](" + station.queueObject.ytUrl + ") (Keywords: `" + station.keywords.join(", ") + "`, Genre(s): " + station.queueObject.duration + ")\n";;
            i++;
        }
        if (stationList.length >= 1920) {
            var msgCount = Math.ceil(queue.length / 1920);
            var messages = [];
            let j = 0;
            for (let g = 0; g < msgCount - 1; g++, j+= 1920) {
                bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player: Radio Stations",
                                                "description": "Radio Stations (Page " + (g+1) + " of " + msgCount + ")\n" + stationList.substr(j, 1920),
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
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player: Radio Stations",
                                                "description": "Radio Stations (Page " + msgCount + " of " + msgCount + "):\n" + stationList.substr(j),
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
                                                "title": "Tomoko's Music Player: Radio Stations",
                                                "description": "Radio Stations:\n" + stationList,
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
