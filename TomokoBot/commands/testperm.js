module.exports.run = (message, args) => { // Command to test the noperm and the invalid args message.
    if (args.length === 0) {
        noPermission(message, message.author, message.content.split(" ")[0]);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
};

module.exports.options = {
    "cooldown": 5000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
