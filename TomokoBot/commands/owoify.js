async function owo(sender, channelId, text) {
    var owo = await neko.sfw.OwOify({ text: text });
    logger.info(owo.owo);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Tomoko's OwOified Text Converter OwO",
            "description": ":inbox_tray: Input:\n" + text + "\n:outbox_tray: Output:\n" + owo.owo,
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
    }); // Send a message with owoified text as embed
}

module.exports.run = (message, args) => { // Command to owoify a text
    if (args.length >= 1) {
        owo(message.member, message.channel.id, args.join(" "));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
