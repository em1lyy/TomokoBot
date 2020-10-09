module.exports.run = (message, args) => { // Command to get info about a character
    if (args.length >= 1) {
        if (/^\d+$/.test(args[0])) {
            if (args.length == 1) {
                AniList.people.character(parseInt(args[0])).then((data) => {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's AniList Search",
                                                            "description": "S-Search Result f-for \"" + args[0] + "\"",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": data.image.large
                                                            },
                                                            "fields": [
                                                                { "name": "Name", "value": data.name.english + " // " + data.name.native, "inline": true },
                                                                { "name": "ID", "value": data.id, "inline": true },
                                                                { "name": "Favourites", "value": data.favourites, "inline": true },
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
            AniList.search("character", searchQuery, 1, 1).then(searchRes => {
                var aniId = searchRes.characters[0].id;
                AniList.people.character(aniId).then((data) => {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's AniList Search",
                                                            "description": "S-Search R-Result f-for \"" + args.join(" ") + "\"",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": data.image.large
                                                            },
                                                            "fields": [
                                                                { "name": "Name", "value": data.name.english + " // " + data.name.native, "inline": true },
                                                                { "name": "ID", "value": data.id, "inline": true },
                                                                { "name": "Favourites", "value": data.favourites, "inline": true },
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
