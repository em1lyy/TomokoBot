module.exports.run = (message, args) => {
    if (!message.channel.guild)
        return "T-This command c-can only be used i-in a guild!";
    if ((args.length === 1 || args.length === 2) && message.mentions.length === 1 && !message.mentionEveryone) {
        if (message.member.permissions.has("kickMembers")) {
            if (args.length === 1)
                bot.kickGuildMember(message.channel.guild.id, message.mentions[0].id);
            else
                bot.kickGuildMember(message.channel.guild.id, message.mentions[0].id, args[1]);
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
