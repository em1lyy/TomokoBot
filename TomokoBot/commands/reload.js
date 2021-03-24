/**
 * This file is part of Tomoko, a Discord Bot for
 * moderation, fun, levels, music and much more!
 * Copyright (C) 2018-2021 Emily <elishikawa@jagudev.net>
 *
 * Tomoko is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Tomoko.  If not, see <https://www.gnu.org/licenses/>.
**/

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
