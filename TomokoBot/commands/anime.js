module.exports.run = (message, args) => { // Command to get info about an anime
    if (args.length >= 1) {
        if (/^\d+$/.test(args[0])) {
            if (args.length == 1) {
                AniList.media.anime(parseInt(args[0])).then((data) => {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's AniList Search",
                                                            "description": "S-Search Result f-for \"" + args[0] + "\"",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": data.coverImage.large
                                                            },
                                                            "fields": [
                                                                { "name": "Title", "value": data.title.english + " // " + data.title.romaji, "inline": true },
                                                                { "name": "ID", "value": data.id, "inline": true },
                                                                { "name": "Format", "value": data.format, "inline": true },
                                                                { "name": "Episodes", "value": ((data.episodes) ? data.episodes : "TBA"), "inline": true },
                                                                { "name": "Episode Duration", "value": ((data.duration) ? data.episodes + " minutes" : "TBA"), "inline": true },
                                                                { "name": "Average Score", "value": ((data.averageScore) ? data.averageScore + "%" : "Unrated"), "inline": true },
                                                                { "name": "Description", "value": data.description.replace(/<br>/gm, '').replace(/<.?i>/gm, '*').replace(/<.?b>/gm, '**').substring(0, 1024) }
                                                            ],
                                                            "author": {
                                                                "name": "Tomoko Bot",
                                                                "icon_url": bot.user.avatarURL
                                                            },
                                                            "footer": {
                                                                "icon_url": message.author.avatarURL,
                                                                "text": "Requested by: " + getUserName(message.member)
                                                            }
                                                        }
                                                    });
                });
            } else {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            var searchQuery = args.join(" ");
            AniList.search("anime", searchQuery, 1, 1).then(searchRes => {
                var aniId = searchRes.media[0].id;
                AniList.media.anime(aniId).then((data) => {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's AniList Search",
                                                            "description": "S-Search R-Result for \"" + args.join(" ") + "\"",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": data.coverImage.large
                                                            },
                                                            "fields": [
                                                                { "name": "Title", "value": data.title.english + " // " + data.title.romaji, "inline": true },
                                                                { "name": "ID", "value": data.id, "inline": true },
                                                                { "name": "Format", "value": data.format, "inline": true },
                                                                { "name": "Episodes", "value": ((data.episodes) ? data.episodes : "TBA"), "inline": true },
                                                                { "name": "Episode Duration", "value": ((data.duration) ? data.episodes + " minutes" : "TBA"), "inline": true },
                                                                { "name": "Average Score", "value": ((data.averageScore) ? data.averageScore + "%" : "Unrated"), "inline": true },
                                                                { "name": "Description", "value": data.description.replace(/<br>/gm, '').replace(/<.?i>/gm, '*').replace(/<.?b>/gm, '**').substring(0, 1024) }
                                                            ],
                                                            "author": {
                                                                "name": "Tomoko Bot",
                                                                "icon_url": bot.user.avatarURL
                                                            },
                                                            "footer": {
                                                                "icon_url": message.author.avatarURL,
                                                                "text": "Requested by: " + getUserName(message.member)
                                                            }
                                                        }
                                                    });
                });
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
