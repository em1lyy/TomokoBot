module.exports.run = (message, args) => { // About me command
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Story",
                                                "description": messages.aboutme_desc.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "fields": messages.aboutme_fields
                                            }
                                           }); // Send my story
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 8000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 6
};
