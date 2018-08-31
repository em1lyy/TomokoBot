const Eris = require("eris");
const logger = require("winston");
const auth = require("./auth.json");
const messages = require("./assets/messages.json");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Eris object
var bot = new Eris.Client(auth.token);

bot.on("ready", () => {    // When the bot is ready
    logger.info("Ready!"); // Log "Ready!" and some information
    logger.info("User: " + bot.user.username); // User name
    logger.info("Start Timestamp: " + bot.startTime); // Start time as timestamp
});

bot.on("guildMemberAdd", (guild, member) => { // When an user joins the server
    logger.info("Join event called!"); // Log "Join event called!",
    logger.info("Guild name: " + guild.name + " (ID: " + guild.id + ")"); // the guild name
    logger.info("User name: " + member.username); // and the username
    var welcomeMsgId = Math.floor(Math.random() * messages.welcome.length); // Generate a random number
    bot.createMessage(guild.systemChannelID, messages.welcome[welcomeMsgId]); // Send a random welcome message
});

bot.on("messageCreate", (message) => { // When a message is created, here's most part of the work
    // First off, if the message mentions me, 
    // send a random mention message
    if (message.mentions.includes(bot.user)) {
        var mentionMsgId = Math.floor(Math.random() * messages.mention.length); // Generate a random number
        bot.createMessage(message.channel.id, messages.mention[mentionMsgId]); // Send a random welcome message
    }
    if (message.content === "*testperm") {
        noPermission(message, message.author, message.content.split(" ")[0]);
    }
    if (message.content == "*shutdown") {
        if (message.member.permission.has("administrator")) {
            message.channel.guild.shard.disconnect();
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    }
});

function noPermission(message, user, command) {
    bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "No Permission!",
                                                "description": messages.noperm.replace("$user", user.mention).replace("$command", command),
                                                "color": 16684873,
                                                "thumbnail": {
                                                "url": user.avatarURL
                                                },
                                                "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send a "You don't have the permission to perform this action" message.
}

// Get the bot to connect to Discord
bot.connect();
