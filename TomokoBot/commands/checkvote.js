module.exports.run = (message, args) => { // Check vote on discordbots.org
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Vote Checker",
                                                "description": messages.vote.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send vote message
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
