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
