module.exports.run = (message, args) => {
    if (!message.channel.guild)
        return "T-This command c-can only be used i-in a guild!";
    if ((args.length >= 1 || args.length <= 3) && message.mentions.length === 1 && !message.mentionEveryone) {
        if (message.member.permission.has("banMembers")) {
            if (args.length === 3) {
                if (parseInt(args[2]) == NaN)
                    invalidArgs(message, message.author, message.content.split(" ")[0]);
            }
            if (args.length === 1)
                bot.banGuildMember(message.channel.guild.id, message.mentions[0].id);
            else if (args.length === 2)
                bot.banGuildMember(message.channel.guild.id, message.mentions[0].id, 0, args[1]);
            else
                bot.banGuildMember(message.channel.guild.id, message.mentions[0].id, parseInt(args[2]), args[1]);
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 5000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 3
};
