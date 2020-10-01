module.exports.run = (message, args) => { // Command that was initially though to add a friend, but sadly doesn't work
    if (args.length === 1) {
        if (message.author.id === config.ownerId) {
            logInfo("Sending friend request to <@!" + args[0] + "> .");
            bot.addRelationship(args[0], false);
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 12000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 3
};
