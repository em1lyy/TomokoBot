module.exports.run = (message, args) => { // Roll a (virtual) dice
    if (args.length === 0) {
        var result = Math.floor(Math.random() * 6); // Generate a random number
        bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Dice",
                                            "description": "T-The result is:\n:game_die: " + (result + 1) + "!",
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                        }); // Send a message with the dice result
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
