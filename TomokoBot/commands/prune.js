module.exports.run = (message, args) => {
    if (!message.channel.guild)
        return "T-This command c-can only be used i-in a guild!";
    if (args.length === 1) {
        if (message.member.permissions.has("manageGuild")) {
            if (parseInt(args[0]) == NaN)
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            bot.pruneMembers(message.channel.guild.id, {
                "days": parseInt(args[0]),
                "reason": message.author.username
            });
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 45000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
