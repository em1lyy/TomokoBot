module.exports.run = (message, args) => {
    var normalizedPath = require("path").join(__dirname, "../commands");

    for (let i = 0; i < registeredCommands.length; i++) {
        bot.unregisterCommand(registeredCommands[i]);
        delete require.cache[require.resolve("../commands/" + registeredCommands[i] + ".js")];
        bot.unregisterCommand(registeredCommands[i]);
        console.log("unregistered " + registeredCommands[i]);
    }

    registeredCommands = [];
    let i = 0;
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        var currentCmd = require("../commands/" + file);
        bot.registerCommand(file.replace(".js", ""), currentCmd.run, currentCmd.options);
        registeredCommands[i] = file.replace(".js", "");
        console.log("registered " + registeredCommands[i]);
        i++;

    });
};

module.exports.options = {
    "cooldown": 45000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
