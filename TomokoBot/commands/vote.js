module.exports.run = (message, args) => { // Vote for me :)
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Vote for Tomoko",
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
