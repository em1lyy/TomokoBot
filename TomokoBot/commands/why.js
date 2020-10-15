async function why(sender, channelId) {
    var why = await neko.sfw.why();
    logger.info(why);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Tomoko's Random Questions :question:",
            "description": why.why,
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + getUserName(sender)
            }
        }
    }); // Send a message with a fact as embed.
}

module.exports.run = (message, args) => { // Command to get a random fact
    if (args.length === 0) {
        why(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
