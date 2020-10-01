module.exports.run = (message, args) => { // Command to reboot Tomoko
    if (args.length === 0) {
        if (message.author.id === config.ownerId) {
            logInfo("Shutting down.");
            bot.disconnect();
            clearTimeout(playingStatusUpdater);
            logger.info("Shut down.");
            process.exit();
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
    "cooldownReturns": 3
};
