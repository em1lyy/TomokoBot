const Eris = require("eris");
const logger = require("winston");
const auth = require("./auth.json");
const messages = require("./assets/messages.json");
const pkg = require("./package.json");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Eris object
var bot = new Eris.CommandClient(auth.token, 
                          {
                              "defaultImageSize": 512,
                              "autoreconnect": true,
                              "defaultImageFormat": "jpg"
                          },
                          {
                              "defaultHelpCommand": false,
                              "description": "Hi! I am Tomoko, a Discord Bot for moderation, fun, levels, music and much more!",
                              "name": "Tomoko",
                              "owner": "Jonas Jaguar",
                              "prefix": "*"
                          }
);

// Initialize some variables
var playingStatusUpdater;
var uptimeH = 0;
var uptimeM = 0;
var uptimeS = 0;

bot.on("ready", () => {    // When the bot is ready
    logger.info("Ready!"); // Log "Ready!" and some information
    logger.info("User: " + bot.user.username); // User name
    logger.info("Start Timestamp: " + bot.startTime); // Start time as timestamp
    logger.info("Setting information!"); // "Setting information"
    var playMsgId = Math.floor(Math.random() * messages.playing.length); // Generate a random number
    bot.editStatus("online", { // Set status
        "name":"*help | " + messages.playing[playMsgId],
        "type":0,
        "url":"https://github.com/jonasjaguar/TomokoBot"
    });
    playingStatusUpdater = setInterval(function() { // Change status every minute
        var playMsgId = Math.floor(Math.random() * messages.playing.length); // Generate a random number
        bot.editStatus("online", { // Set status
            "name":"*help | " + messages.playing[playMsgId],
            "type":0,
            "url":"https://github.com/jonasjaguar/TomokoBot"
        });
    }, 60000);
});

bot.registerCommand("testperm", (message, args) => { // Command to test the noperm and the invalid args message.
    if (args.length === 0) {
        noPermission(message, message.author, message.content.split(" ")[0]);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 5000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("status", (message, args) => {
    if (args.length === 0) {
        refreshUptime(); // Refresh the Uptime variables
        var guildsInCurrentShard = 0;
        bot.guilds.forEach((guild) => { // Calcutale guild count for message author's shard
            if(guild.shard.id === message.member.guild.shard.id) {
                guildsInCurrentShard++;
            }
        });
        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Status",
                                                    "description": "O-Oh, you want some i-information about m-my current status?\nO-Okay, h-here you go:",
                                                    "color": 16684873,
                                                    "footer": {
                                                        "icon_url": message.author.avatarURL,
                                                        "text": "Requested by: " + message.member.nick
                                                    },
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "fields": [
                                                        {
                                                            "name": ":clock3: Uptime",
                                                            "value": "**" + uptimeH + "** hour(s), **" + uptimeM + "** minute(s) and **" + uptimeS + "** second(s)."
                                                        },
                                                        {
                                                            "name": ":desktop: Current Version",
                                                            "value": "I am currently running **Version " + pkg.version + "**."
                                                        },
                                                        {
                                                            "name": ":earth_africa: Global Analytics",
                                                            "value": "Guilds: **" + bot.guilds.size + "**\nShards: **" + bot.shards.size + "**\nUsers: **" + bot.users.size + "**",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":diamond_shape_with_a_dot_inside: This Shard Analytics",
                                                            "value": "Guilds: **" + guildsInCurrentShard + "**\nShard ID: **" + message.member.guild.shard.id + "**\nUsers: **" + message.member.guild.members.size + "**",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":speaker: Music Status",
                                                            "value": "I am currently **not playing** any music."
                                                        },
                                                        {
                                                            "name": ":thumbsup: Like me?",
                                                            "value": "O-Oh, y-you like m-me? M-Me? Oh, i-if you r-really do s-so, y-you can v-vote for me at [Discord Bot List](https://discordbots.org/)."
                                                        },
                                                        {
                                                            "name": ":handshake: Support",
                                                            "value": "If you need Support, please join [my Discord Server](https://discord.gg/mhmERk8)"
                                                        }
                                                    ]
                                                }
                                            });
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 5000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("avatar", (message, args) => { // Command to get the avatar of an user
    if (args.length === 1) {
        if (message.mentionEveryone) {
            warnEveryone(message, message.author, message.content.split(" ")[0]);
            return;
        }
        if (message.mentions.length === 1) {
            message.mentions[0].avatarURL
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Avatar for " + message.mentions[0].username + ":",
                                                "description": "[Avatar URL Link](" + message.mentions[0].avatarURL + ")",
                                                "color": 16684873,
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "image": {
                                                    "url": message.mentions[0].avatarURL
                                                },
                                                "footer": {
                                                    "icon_url": message.author.avatarURL,
                                                    "text": "Requested by: " + message.member.nick
                                                }
                                            }
                                           }); // Send a message with the avatar as embed.
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
            return;
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
        return;
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.on("guildMemberAdd", (guild, member) => { // When an user joins the server
    logger.info("Join event called!"); // Log "Join event called!",
    logger.info("Guild name: " + guild.name + " (ID: " + guild.id + ")"); // the guild name
    logger.info("User name: " + member.username); // and the username
    var welcomeMsgId = Math.floor(Math.random() * messages.welcome.length); // Generate a random number
    bot.createMessage(guild.systemChannelID, messages.welcome[welcomeMsgId]); // Send a random welcome message
});

bot.on("messageCreate", (message) => { // When a message is created
    // First off, if the message mentions me, 
    // send a random mention message
    if (message.content === bot.user.mention) {
        var mentionMsgId = Math.floor(Math.random() * messages.mention.length); // Generate a random number
        bot.createMessage(message.channel.id, messages.mention[mentionMsgId]); // Send a random mention message
    }
    /**if (message.content == "*shutdown") { // Used for some little testing. Senseless.
        if (message.member.permission.has("administrator")) {
            message.channel.guild.shard.disconnect();
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    }**/
});

function noPermission(message, user, command) { // A function to call whenever a user tries to do something which they don't have permission to do
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

function invalidArgs(message, user, command) { // A fuction that tells the user that he used the command incorrectly
    bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Wrong Command Usage!",
                                                "description": messages.wrongargs.replace("$user", user.mention).replace("$command", command),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send an "Invalid arguments" message.
}

function warnEveryone(message, user, command) { // A function that tells the user not to use @everyone or @here
    bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Don't do that!",
                                                "description": messages.everyoneWarn.replace("$user", user.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send a "Please don't use @everyone/@here" message.
}

function refreshUptime() { // A function to refresh the uptime variables
    uptimeH = Math.floor(bot.uptime / 60 / 60 / 1000);
    uptimeM = Math.floor((bot.uptime / 60 / 1000) % 60);
    uptimeS = Math.floor((bot.uptime / 1000) % 60);
}

process.on('SIGINT', function() { // CTRL+C / Kill process event
    logger.info("Shutting down.");
    bot.disconnect();
    clearTimeout(playingStatusUpdater);
    logger.info("Shut down.");
    process.exit();
});

// Get the bot to connect to Discord
bot.connect();
