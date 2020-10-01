module.exports.run = (message, args) => { // Support Command
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Support",
                                                "description": messages.support.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send support thing
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
