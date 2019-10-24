/**
 *
 * Hi! I am Tomoko, a Discord Bot for moderation, fun, levels, music and much more!
 * Copyright (C) 2018 Jonas Jaguar <jonasjaguar@jagudev.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
**/

const Eris = require("eris");
const winston = require("winston");
const Client = require("nekos.life");
const auth = require("./auth.json");
const messages = require("./assets/messages.json");
const help = require("./assets/help.json");
const pkg = require("./package.json");
const config = require("./config.json");
const jokes = require("./assets/jokes.json");
const catfacts = require("./assets/catfacts.json");
const rpsData = require("./assets/rps.json");
const ytdl = require("youtube-dl");
const urlHelper = require("url");
const fetch = require("node-fetch");

// Get current timestamp
var logStamp = Date.now();

// Configure logger settings
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [
    // - All log: ./logs/full/${timestamp}.log
    // - Error log: ./logs/error/${timestamp}.log
    new winston.transports.File({ filename: "logs/error/" + logStamp + ".log", level: "error" }),
    new winston.transports.File({ filename: "logs/full/" + logStamp + ".log", level: "silly" })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialize Eris object
var bot = new Eris.CommandClient(auth.token,
                          {
                              "defaultImageSize": 512,
                              "autoreconnect": true,
                              "defaultImageFormat": "jpg",
                              "maxShards": config.shardCount
                          },
                          {
                              "defaultHelpCommand": false,
                              "description": "Hi! I am Tomoko, a Discord Bot for moderation, fun, levels, music and much more!",
                              "name": "Tomoko",
                              "owner": "Jonas Jaguar",
                              "prefix": "*"
                          }
);

// Initialize nekos.life API
var neko = new Client();

// Initialize some variables
var playingStatusUpdater;
var uptimeH = 0;
var uptimeM = 0;
var uptimeS = 0;
var musicGuilds = new Map();

/**
 *
 * LOGGING ON MY SERVER
 *
**/

process.on("uncaughtException", (err) => { // When an exception occurs...
    logger.error("Caught exception: " + err.message); // Log exception message...
    logger.info("Stack trace: " + err.stack); // ..and stack trace to console using winston...
    bot.createMessage(config.outputChannelId, ":warning: Jonas! Something went wrong here!\n:speech_balloon: Message: " + err.message + "\n:information_source: Stack Trace:\n```" + err.stack + "```"); // ...and send a message to my log channel.
});

process.on("unhandledRejection", (err, p) => { // When an promise rejection occurs...
    logger.error("Caught exception: " + err.message); // Log exception message...
    logger.info("Stack trace: " + err.stack); // ..and stack trace to console using winston...
    bot.createMessage(config.outputChannelId, ":warning: Jonas! Something went wrong here!\n:speech_balloon: Message: " + err.message + "\n:information_source: Stack Trace:\n```" + err.stack + "```"); // ...and send a message to my log channel.
});

bot.on("error", (err, id) => { // When an exception occurs...
    logger.error("Caught exception: " + err.message + " from shard # " + id); // Log exception message and Shard ID...
    logger.info("Stack trace: " + err.stack); // ..and stack trace to console using winston...
    bot.createMessage(config.outputChannelId, ":warning: Jonas! Something went wrong in shard " + id + "!\n:speech_balloon: Message: " + err.message + "\n:information_source: Stack Trace:\n```" + err.stack + "```"); // ...and send a message to my log channel.
});

function logInfo(message) { // Alter log function
    logger.info(message); // Log message to winston...
    bot.createMessage(config.outputChannelId, ":information_source: " + message); // ...and send message to my log channel.
}

function logError(err, shardId) { // Alter error function
    logger.error("Caught exception: " + err.message + " from shard # " + shardId); // Log exception message and Shard ID...
    logger.info("Stack trace: " + err.stack); // ..and stack trace to console using winston...
    bot.createMessage(config.outputChannelId, ":warning: Jonas! Something went wrong in shard " + shardId + "!\n:speech_balloon: Message: " + err.message + "\n:information_source: Stack Trace:\n```" + err.stack + "```"); // ...and send a message to my log channel.
}

/**
 * Function to prevent the bot from being interrupted.
 * When Ctrl+C is pressed, it first shuts the bot down and doesn't just destroys it.
 * That's bad, trust me. And it hurts.
**/

process.on("SIGINT", function () { // CTRL+C / Kill process event
    logInfo("Shutting down.");
    bot.disconnect();
    clearTimeout(playingStatusUpdater);
    logger.info("Shut down.");
    process.exit();
});

/**
 *
 * MISC FUNCTIONS
 *
**/

function getUserName(member) {
    if (member.nick === null) {
        return member.username;
    } else {
        return member.nick;
    }
}

async function chat(channelId, message) {
    var chat = await neko.getSFWChat({ text: message });
    logger.info(chat);
    bot.createMessage(channelId, ":speech_balloon: " + chat.response); // Send a message with the response
}

function checkVote(user) { // A function to check if the user has voted for me on discordbots.org
    return true;
}

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
            "description": messages.wrongargs.replace("$user", user.mention).replace("$command", command.replace("*", "")),
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

function subCommandRequired(message, user, command) { // A function to tell the user that they should specify a subcommand
    bot.createMessage(message.channel.id, {
        "embed": {
            "title": "Wrong Command Usage!",
            "description": messages.subcmd.replace("$user", user.mention).replace("$command", command.replace("*", "")),
            "color": 16684873,
            "thumbnail": {
                "url": user.avatarURL
            },
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            }
        }
    }); // Send an "Subcommand required" message.
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

function weebShHint(user, channelId, command) {
    bot.createMessage(channelId, {
        "embed": {
            "title": "Not Aviable Yet!",
            "description": messages.weebShHint.replace("$user", user.mention).replace("$command", command),
            "color": 16684873,
            "thumbnail": {
                "url": user.avatarURL
            },
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            }
        }
    }); // Inform the user about my missing permission to access the Weeb.sh API.
}

bot.on("ready", () => {    // When the bot is ready
    logInfo("Ready event called!"); // Log "Ready!" and some information
    logInfo("User: " + bot.user.username); // User name
    logInfo("Start Timestamp: " + bot.startTime); // Start time as timestamp
    logInfo("Timestamp for log files: " + logStamp); // Log file timstamp
    logInfo("Setting information!"); // "Setting information"
    var playMsgId = Math.floor(Math.random() * messages.playing.length); // Generate a random number
    var playMsg = messages.playing[playMsgId];
    bot.editStatus("online", { // Set status
        "name":"*help | " + playMsg,
        "type":0,
        "url":"https://github.com/jonasjaguar/TomokoBot"
    });
    playingStatusUpdater = setInterval(function() { // Change status every minute
        var playMsgId = Math.floor(Math.random() * messages.playing.length); // Generate a random number
        var playMsg = messages.playing[playMsgId];
        bot.editStatus("online", { // Set status
            "name":"*help | " + playMsg,
            "type":0,
            "url":"https://github.com/jonasjaguar/TomokoBot"
        });
    }, 60000);
    logInfo("Everything set up! I'm now up and running!");
});

/**
 *
 * CORE COMMANDS
 *
**/

bot.registerCommand("reboot", (message, args) => { // Command to reboot Tomoko
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
},
{
    "cooldown": 45000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 3
});

bot.registerCommand("servers", (message, args) => { // Displays every server Tomoko is in.
    if (args.length === 0) {
        if (message.author.id === config.ownerId) {
            logInfo("Servers requested.");
            var guild = message.member.guild;
            var servers = "";
            bot.guilds.forEach((value, key, map) => {
                servers += value.name + "\n";
            });

            if (servers.length >= 1920) {
                var msgCount = Math.ceil(servers.length / 1920);
                var messages = [];
                let j = 0;
                for (let g = 0; g < msgCount - 1; g++, j+= 1920) {
                    bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Servers",
                                                    "description": "Servers (Page " + (g+1) + " of " + msgCount + ")\n" + servers.substr(j, 1920),
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
                }
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Servers",
                                                    "description": "Servers (Page " + msgCount + " of " + msgCount + "):\n" + servers.substr(j),
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });

            } else {
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Servers",
                                                    "description": "Servers:\n" + servers,
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
            }
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 30000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 3
});

bot.registerCommand("addfriend", (message, args) => { // Command that was initially though to add a friend, but sadly doesn't work
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
},
{
    "cooldown": 12000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 3
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
        var musicStatus = "**not playing** any music.";
        if (musicGuilds.has(message.member.guild.id)) {
            musicStatus = "playing **" + musicGuilds.get(message.member.guild.id).queue[0].title + "**.";
        }
        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Status",
                                                    "description": "O-Oh, you want some i-information about m-my current status?\nO-Okay, h-here you go:",
                                                    "color": 16684873,
                                                    "footer": {
                                                        "icon_url": message.author.avatarURL,
                                                        "text": "Requested by: " + getUserName(message.member)
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
                                                            "value": "I am currently " + musicStatus
                                                        },
                                                        {
                                                            "name": ":floppy_disk: RAM Usage",
                                                            "value": "**" + (Math.round(process.memoryUsage().rss / 1024 /1024)) + "** MB",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":floppy_disk: Heap Usage",
                                                            "value": "**" + (Math.round(process.memoryUsage().heapUsed / 1024 / 1024)) + "** MB / **" + (Math.round(process.memoryUsage().heapTotal / 1024 / 1024)) + "** MB",
                                                            "inline": true
                                                        },
                                                        {
                                                            "name": ":thumbsup: Like me?",
                                                            "value": "O-Oh, y-you like m-me? M-Me? Oh, i-if you r-really do s-so, y-you can v-vote for me at [Discord Bot List](https://discordbots.org/)."
                                                        },
                                                        {
                                                            "name": ":handshake: Support",
                                                            "value": "If you need Support, please join [my Discord Server](https://discord.gg/EK9F28B)"
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
                                                    "text": "Requested by: " + getUserName(message.member)
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

bot.registerCommand("help", (message, args) => { // Help command
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": help.help.title,
                                                    "description": help.help.description,
                                                    "color": 16684873,
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "footer": {
                                                        "icon_url": message.author.avatarURL,
                                                        "text": "78 commands, Requested by: " + getUserName(message.member)
                                                    },
                                                    "fields": help.help.fields
                                                }
        });
    } else if (args.length === 1) {
        if (!(help.commandsWithHelp.includes(args[0]))) {
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "No Help Aviable!",
                                                "description": "No h-help for command `" + args[0] + "` f-found!",
                                                "color": 16684873,
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                "footer": {
                                                    "icon_url": message.author.avatarURL,
                                                    "text": "Requested by: " + getUserName(message.member)
                                                }
                                            }
                                           }); // Send a "no help aviable" message.
            return;
        }
        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": help.help.title,
                                                    "description": "Help for command: `" + args[0] + "`",
                                                    "color": 16684873,
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "footer": {
                                                        "icon_url": message.author.avatarURL,
                                                        "text": "Requested by: " + getUserName(message.member)
                                                    },
                                                    "fields": [
                                                        {
                                                            "name": ":keyboard: Usage",
                                                            "value": "`" + help.commands[args[0]].usage + "`"
                                                        },
                                                        {
                                                            "name": ":pencil: Description",
                                                            "value": help.commands[args[0]].description
                                                        }
                                                    ]
                                                }
        });
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("invite", (message, args) => { // Send invite for bot
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko Invite Link",
                                                "description": messages.invite.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": message.author.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send the invite for Tomoko
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("aboutme", (message, args) => { // About me command
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Story",
                                                "description": messages.aboutme_desc.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "fields": messages.aboutme_fields
                                            }
                                           }); // Send my story
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 8000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 6
});

bot.registerCommand("support", (message, args) => { // Support Command
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Support",
                                                "description": messages.support.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send support thing
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("vote", (message, args) => { // Vote for me :)
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Vote for Tomoko",
                                                "description": messages.vote.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send vote message
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("checkvote", (message, args) => { // Check vote on discordbots.org
    if (args.length === 0) {
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Vote Checker",
                                                "description": messages.vote.replace("$user", message.author.mention),
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           }); // Send vote message
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

/**
 *
 * MUSIC COMMANDS
 *
**/

var playCmd = bot.registerCommand("play", (message, args) => { // Command to play audio from YouTube (required subcommand)
    subCommandRequired(message, message.author, message.content.split(" ")[0]);
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

playCmd.registerSubcommand("yturl", (message, args) => {
    logger.info(args[0] + " --- " + args.length);
    if (args.length === 1) {
        var urlObj = urlHelper.parse(args[0]);
        var hostname = urlObj.hostname;
        if (hostname === "youtube.com" || hostname === "www.youtube.com" || hostname === "youtu.be" || hostname === "www.youtu.be") {
            if (musicGuilds.has(message.member.guild.id)) {
                var guild = musicGuilds.get(message.member.guild.id);
                ytdl.getInfo(args[0], [], (err, info) => {
                    if (err) {
                        logError(err);
                        throw err;
                    }

                    logger.info(info.duration + " -- " + config.maxSongDuration + " -- " + (info.duration >= config.maxSongDuration));

                    var duration = 0;
                    var thing = info.duration.split(":");

                    if (thing.length === 3) {
                        duration += parseInt(thing[0] * 60 * 60, 10);
                        duration += parseInt(thing[1] * 60, 10);
                        duration += parseInt(thing[2], 10);
                    } else if (thing.length === 2) {
                        duration += parseInt(thing[0] * 60, 10);
                        duration += parseInt(thing[1], 10);
                    } else if (thing.length === 1) {
                        duration += parseInt(thing[0], 10);
                    }

                    if (duration >= config.maxSongDuration) {
                        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "W-Whoa! T-That's a pretty l-long song, d-don't you think?\nM-Maybe you should t-try again with a s-song that i-is shorter t-than **10 m-minutes**.",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
                        return;
                    }

                    var highestBitrate = 0;
                    var bestFormat;
                    for (let j = 0; j < info.formats.length; j++) {
                        let format = info.formats[j];
                        if (format.format.indexOf("audio only") === -1) {
                            continue;
                        }
                        if (format.abr > highestBitrate) {
                            if (highestBitrate === 0) {
                                highestBitrate = format.abr;
                                bestFormat = format;
                            } else {
                                if (format.abr <= config.maxBitRate) {
                                    highestBitrate = format.abr;
                                    bestFormat = format;
                                }
                            }
                        }
                    }

                    bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": ":white_check_mark: S-Song added t-to queue: **" + info.title + "**",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": info.thumbnail
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });

                    guild.queue.push({
                        "url": bestFormat.url,
                        "ytUrl": "youtube.com/watch?v=" + info.id,
                        "title": info.title,
                        "thumbnail": info.thumbnail,
                        "duration": info.duration
                    });

                    if (guild.firstSong) {
                        guild.firstSong = false;
                        clearTimeout(guild.leaveCountdown);
                        let daguild = musicGuilds.get(message.member.guild.id);
                        bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player",
                                                    "description": ":loud_sound: N-Now playing: **" + daguild.queue[0].title + "**",
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": daguild.queue[0].thumbnail
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
                        guild.connection.play(daguild.queue[0].url);
                    }

                });

            } else {
                bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
            }
        } else {
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "T-This is n-not a YouTube URL!\nP-Please check y-your spelling. If you w-want to search o-on YouTube, use `play yt <query>`.",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

playCmd.registerSubcommandAlias("youtube", "yturl");
playCmd.registerSubcommandAlias("url", "yturl");

playCmd.registerSubcommand("listenmoe", (message, args) => {
    if (args.length === 1) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            if (args[0] === "jpop" || args[0] === "Jpop" || args[0] === "JPop" || args[0] === "j" || args[0] === "J" || args[0] === "JPOP") {
                guild.queue.push({
                    "url": "https://listen.moe/opus",
                    "ytUrl": "https://listen.moe",
                    "title": "LISTEN.moe JPop",
                    "thumbnail": "https://listen.moe/public/images/icons/apple-touch-icon.png",
                    "duration": "Pretty long I guess"
                });
                if (guild.connection.playing) {
                    guild.connection.stopPlaying();
                }
                guild.queue = [];
                guild.queue.push({
                    "url": "https://listen.moe/opus",
                    "ytUrl": "https://listen.moe",
                    "title": "LISTEN.moe JPop",
                    "thumbnail": "https://listen.moe/public/images/icons/apple-touch-icon.png",
                    "duration": "Pretty long I guess"
                });
                guild.connection.play(guild.queue[0].url);
            } else if (args[0] === "kpop" || args[0] === "Kpop" || args[0] === "KPop" || args[0] === "k" || args[0] === "K" || args[0] === "KPOP") {
                guild.queue.push({
                    "url": "https://listen.moe/kpop/opus",
                    "ytUrl": "https://listen.moe/kpop",
                    "title": "LISTEN.moe KPop",
                    "thumbnail": "https://listen.moe/public/images/icons/apple-touch-icon-kpop.png",
                    "duration": "Pretty long I guess"
                });
                if (guild.connection.playing) {
                    guild.connection.stopPlaying();
                }
                guild.queue = [];
                guild.queue.push({
                    "url": "https://listen.moe/kpop/opus",
                    "ytUrl": "https://listen.moe/kpop",
                    "title": "LISTEN.moe KPop",
                    "thumbnail": "https://listen.moe/public/images/icons/apple-touch-icon-kpop.png",
                    "duration": "Pretty long I guess"
                });
                guild.connection.play(guild.queue[0].url);
            } else {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            }
            clearTimeout(guild.leaveCountdown);
            bot.createMessage(message.channel.id, {
                                    "embed": {
                                        "title": "Tomoko's Music Player",
                                        "description": ":loud_sound: N-Now playing: **" + guild.queue[0].title + "**",
                                        "color": 16684873,
                                        "thumbnail": {
                                            "url": guild.queue[0].thumbnail
                                        },
                                        "author": {
                                            "name": "Tomoko Bot",
                                            "icon_url": bot.user.avatarURL
                                        }
                                    }
                                });
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                        });
            }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

playCmd.registerSubcommandAlias("moe", "listenmoe");
playCmd.registerSubcommandAlias("radio", "listenmoe");
playCmd.registerSubcommandAlias("listen", "listenmoe");
playCmd.registerSubcommandAlias("lmoe", "listenmoe");
playCmd.registerSubcommandAlias("listen.moe", "listenmoe");

bot.registerCommand("pause", (message, args) => { // Command to pause/resume
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            if (!guild.connection.paused) {
                guild.connection.pause();
                bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": ":play_pause: " + message.member.mention + ", audio h-has b-been paused!",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                        });
            } else {
                guild.connection.resume();
                bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": ":play_pause: " + message.member.mention + ", a-audio has been r-resumed!",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                        });
            }
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("stop", (message, args) => { // Command to stop playing and leave the channel
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            guild.queue = [];
            if(guild.connection.playing) { // Stop playing if the connection is playing something
                guild.connection.stopPlaying();
            }
            bot.leaveVoiceChannel(guild.channelID);
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("skip", (message, args) => { // Command to skip the current song
    if (args.length === 0) {
        if (message.member.permission.has("manageChannels")) {
            if (musicGuilds.has(message.member.guild.id)) {
                var guild = musicGuilds.get(message.member.guild.id);
                if (guild.connection.playing) {
                    guild.connection.stopPlaying();
                } else if (guild.connection.paused) {
                    guild.connection.resume();
                    guild.connection.stopPlaying();
                    guild.connection.pause();
                }
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "S-Skipped the current t-track!",
                                                        "color": 16684873,
                                                        "thumbnail": {
                                                            "url": bot.user.avatarURL
                                                        },
                                                        "author": {
                                                            "name": "Tomoko Bot",
                                                            "icon_url": bot.user.avatarURL
                                                        }
                                                    }
                                                });
            } else {
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                                        "color": 16684873,
                                                        "thumbnail": {
                                                            "url": bot.user.avatarURL
                                                        },
                                                        "author": {
                                                            "name": "Tomoko Bot",
                                                            "icon_url": bot.user.avatarURL
                                                        }
                                                    }
                                                });
            }
        } else {
            if (musicGuilds.has(message.member.guild.id)) {
                var guild = musicGuilds.get(message.member.guild.id); // Skip emoticon: :track_next:
                if (guild.skipVotes > 0) {
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's Music Player",
                                                            "description": "A s-skip voting h-has already b-been started!",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": bot.user.avatarURL
                                                            },
                                                            "author": {
                                                                "name": "Tomoko Bot",
                                                                "icon_url": bot.user.avatarURL
                                                            }
                                                        }
                                                    });
                    return;
                }
                guild.requiredSkipVotes = Math.ceil((bot.getChannel(guild.channelId)).voiceMembers.size / 2);
                if (guild.requiredSkipVotes >= 100) {
                    guild.requiredSkipVotes = 100;
                }
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "S-Skip voting s-started!\nP-Please react w-with :track_next: to v-vote!\nV-Votes till skip: `" + (guild.requiredSkipVotes + 1) + "`\n(Vote will e-end in 30 s-seconds!)",
                                                        "color": 16684873,
                                                        "thumbnail": {
                                                            "url": bot.user.avatarURL
                                                        },
                                                        "author": {
                                                            "name": "Tomoko Bot",
                                                            "icon_url": bot.user.avatarURL
                                                        }
                                                    }
                                                });
            } else {
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                                        "color": 16684873,
                                                        "thumbnail": {
                                                            "url": bot.user.avatarURL
                                                        },
                                                        "author": {
                                                            "name": "Tomoko Bot",
                                                            "icon_url": bot.user.avatarURL
                                                        }
                                                    }
                                                });
            }
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4,
    "reactionButtons": [ // Add reaction buttons to the command
        {
            "emoji": ":track_next:",
            "type": "edit",
            "response": (message) => { // Process the reaction
                var votes = message.getReaction(":track_next:", 102).length;
                var guild = musicGuilds.get(message.member.guild.id);
                if (votes >= (guild.requiredSkipVotes + 1)) {
                    if (guild.connection.playing) {
                        guild.connection.stopPlaying();
                    } else if (guild.connection.paused) {
                        guild.connection.resume();
                        guild.connection.stopPlaying();
                        guild.connection.pause();
                    }
                    guild.skipVotes = 0;
                    guild.requiredSkipVotes = 1;
                    bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's Music Player",
                                                            "description": "S-Skipped the current t-track!",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": bot.user.avatarURL
                                                            },
                                                            "author": {
                                                                "name": "Tomoko Bot",
                                                                "icon_url": bot.user.avatarURL
                                                            }
                                                        }
                                                    });
                }

                return message.content;
            }
        }
    ],
    "reactionButtonTimeout": 30000
});

bot.registerCommand("forceskip", (message, args) => { // Command to force skip the current song (requires channels.manage permission)
    if (args.length === 0) {
        if (message.member.permission.has("manageChannels")) {
            if (musicGuilds.has(message.member.guild.id)) {
                var guild = musicGuilds.get(message.member.guild.id);
                if (guild.connection.playing) {
                    guild.connection.stopPlaying();
                } else if (guild.connection.paused) {
                    guild.connection.resume();
                    guild.connection.stopPlaying();
                    guild.connection.pause();
                }
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "S-Skipped the current t-track!",
                                                        "color": 16684873,
                                                        "thumbnail": {
                                                            "url": bot.user.avatarURL
                                                        },
                                                        "author": {
                                                            "name": "Tomoko Bot",
                                                            "icon_url": bot.user.avatarURL
                                                        }
                                                    }
                                                });
            } else {
                bot.createMessage(message.channel.id, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                                        "color": 16684873,
                                                        "thumbnail": {
                                                            "url": bot.user.avatarURL
                                                        },
                                                        "author": {
                                                            "name": "Tomoko Bot",
                                                            "icon_url": bot.user.avatarURL
                                                        }
                                                    }
                                                });
            }
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("join", (message, args) => { // Command template
    if (args.length === 0) {
        if(!message.channel.guild) { // Check if the message was sent in a guild
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "T-This command c-can only be run in a s-server!",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
            return;
        }
        if(!message.member.voiceState.channelID) { // Check if the user is in a voice channel
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "Y-You need to be i-in a voice channel t-to run this c-command!",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
            return;
        }
        bot.joinVoiceChannel(message.member.voiceState.channelID).catch((err) => { // Join the user's voice channel
            bot.createMessage(message.channel.id, ":x: Error joining voice channel: " + err.message); // Notify the user if there is an error
            logError(err, message.member.guild.shard.id); // Log the error
        }).then((connection) => {
            if(connection.playing) { // Stop playing if the connection is playing something
                connection.stopPlaying();
            }
            connection.setVolume(1.0);
            connection.on("end", (msg) => {
                let daguild = musicGuilds.get(message.member.guild.id);
                let indexx = 0;
                if (daguild.shuffle) {
                    let trackId = Math.floor(Math.random() * daguild.queue.length); // Generate a random number
                    indexx = trackId;
                }
                if (daguild.repeatQueue) {
                    daguild.queue.push(daguild.queue[indexx]);
                }
                if (!daguild.repeatSong) {
                    daguild.queue.splice(indexx, 1);
                }
                if (daguild.queue.length > 0) {
                    bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": ":loud_sound: N-Now playing: **" + daguild.queue[indexx].title + "**",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": daguild.queue[indexx].thumbnail
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
                    daguild.connection.play(daguild.queue[indexx].url);
                } else {
                    if(daguild.connection.playing) { // Stop playing if the connection is playing something
                        daguild.connection.stopPlaying();
                    }
                    bot.leaveVoiceChannel(daguild.channelID);
                    musicGuilds.delete(message.member.guild.id);
                    bot.createMessage(daguild.textChannelId, {
                                                    "embed": {
                                                        "title": "Tomoko's Music Player",
                                                        "description": "F-Finished playing t-the queue, " + getUserName(message.member) + "!\nI hope i-it wasn't t-too bad...",
                                                        "color": 16684873,
                                                        "thumbnail": {
                                                            "url": bot.user.avatarURL
                                                        },
                                                        "author": {
                                                            "name": "Tomoko Bot",
                                                            "icon_url": bot.user.avatarURL
                                                        }
                                                    }
                                                });
                }
            });
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "I-I'm now in your v-voice channel, " + getUserName(message.member) + "!\nP-Please remember that I'll l-leave the channel w-when you don't u-use any m-music functions within the next m-minute!",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                           });
            var leaveTimeout = setTimeout((arg) => {
                logger.info(arg);
                var guild = musicGuilds.get(arg);
                if(guild.connection.playing) { // Stop playing if the connection is playing something
                    guild.connection.stopPlaying();
                }
                bot.leaveVoiceChannel(guild.channelID);
                bot.createMessage(guild.textChannelId, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player",
                                                    "description": "I-I'm no l-longer in your v-voice channel, " + getUserName(message.member) + "!\nD-Don't leave m-me alone again, okay?",
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
                musicGuilds.delete(arg);
            }, 60000, message.member.guild.id);
            musicGuilds.set(message.member.guild.id, {
                "channelID": message.member.voiceState.channelID,
                "connection": connection,
                "queue": [],
                "firstSong": true,
                "shardId": message.member.guild.shard.id,
                "textChannelId": message.channel.id,
                "repeatSong": false,
                "repeatQueue": false,
                "shuffle": false,
                "skipVotes": 0,
                "requiredSkipVotes": 1,
                "leaveCountdown": leaveTimeout
            });
        });
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("queue", (message, args) => { // Command to list the current queue
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var queue = "";
            for (let i = 0; i < guild.queue.length; i++) {
                queue += (i + 1) + ". [" + guild.queue[i].title + "](" + guild.queue[i].ytUrl + ") (" + guild.queue[i].duration + ")\n";
            }
            if (queue.length >= 1920) {
                var msgCount = Math.ceil(queue.length / 1920);
                var messages = [];
                let j = 0;
                for (let g = 0; g < msgCount - 1; g++, j+= 1920) {
                    bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player: Queue",
                                                    "description": "Queue (Page " + (g+1) + " of " + msgCount + ")\n" + queue.substr(j, 1920),
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
                }
                var repeatMode = "NoRepeat";
                if (guild.repeatQueue) {
                    repeatMode = "RepeatQueue";
                } else if (guild.repeatSong) {
                    repeatMode = "RepeatSong";
                }
                var shuffleMode = "NoShuffle";
                if (guild.shuffle) {
                    shuffleMode = "Shuffle";
                }
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player: Queue",
                                                    "description": "Queue (Page " + msgCount + " of " + msgCount + "):\n" + queue.substr(j) + "\nRepeat mode: `" + repeatMode + "`\nShuffle mode: `" + shuffleMode + "`",
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });

            } else {
                var repeatMode = "NoRepeat";
                if (guild.repeatQueue) {
                    repeatMode = "RepeatQueue";
                } else if (guild.repeatSong) {
                    repeatMode = "RepeatSong";
                }
                var shuffleMode = "NoShuffle";
                if (guild.shuffle) {
                    shuffleMode = "Shuffle";
                }
                bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player: Queue",
                                                    "description": "Queue:\n" + queue + "\nRepeat mode: `" + repeatMode + "`\nShuffle mode: `" + shuffleMode + "`",
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
            }
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("repeat", (message, args) => { // Command to set repeat state
    if (args.length === 1) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            if (args[0] === "queue") {
                guild.repeatSong = false;
                guild.repeatQueue = true;
            } else if (args[0] === "song") {
                guild.repeatSong = true;
                guild.repeatQueue = false;
            } else if (args[0] === "off") {
                guild.repeatSong = false;
                guild.repeatQueue = false;
            } else {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            }
            var repeatMode = "NoRepeat";
            if (guild.repeatQueue) {
                repeatMode = "RepeatQueue";
            } else if (guild.repeatSong) {
                repeatMode = "RepeatSong";
            }
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "Repeat m-mode: `" + repeatMode + "`",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                        });
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var repeatMode = "NoRepeat";
            if (guild.repeatQueue) {
                repeatMode = "RepeatQueue";
            } else if (guild.repeatSong) {
                repeatMode = "RepeatSong";
            }
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "R-Repeat mode: `" + repeatMode + "`",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                        });
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("restartsong", (message, args) => { // Command to restart the current song
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var repSong = guild.repeatSong;
            var repQueue = guild.repeatQueue;
            var shuf = guild.shuffle;
            guild.repeatSong = true;
            guild.repeatQueue = false;
            guild.shuffle = false;
            if (guild.connection.playing) {
                guild.connection.stopPlaying();
            } else if (guild.connection.paused) {
                guild.connection.resume();
                guild.connection.stopPlaying();
                guild.connection.pause();
            }
            guild.repeatQueue = repQueue;
            guild.repeatSong = repSong;
            guild.shuffle = shuf;
            bot.createMessage(message.channel.id, {
                                                "embed": {
                                                    "title": "Tomoko's Music Player",
                                                    "description": "R-Restarted the current t-track!",
                                                    "color": 16684873,
                                                    "thumbnail": {
                                                        "url": bot.user.avatarURL
                                                    },
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    }
                                                }
                                            });
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("shuffle", (message, args) => { // Command to shuffle the queue
    if (args.length === 0) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            if (guild.shuffle) {
                guild.shuffle = false;
            } else {
                guild.shuffle = true;
            }
            var shuffleMode = "NoShuffle";
            if (guild.shuffle) {
                shuffleMode = "Shuffle";
            }
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Music Player",
                                                "description": "Shuffle m-mode: `" + shuffleMode + "`",
                                                "color": 16684873,
                                                "thumbnail": {
                                                    "url": bot.user.avatarURL
                                                },
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                }
                                            }
                                        });
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("volume", (message, args) => { // Volume command
    if (args.length === 1) {
        if (musicGuilds.has(message.member.guild.id)) {
            var guild = musicGuilds.get(message.member.guild.id);
            var volume = parseFloat(args[0]);
            if (isNaN(volume)) {
                guild.connection.setVolume(volume);
                bot.createMessage(message.channel.id, {
                                                        "embed": {
                                                            "title": "Tomoko's Music Player",
                                                            "description": "V-Volume s-set to `" + guild.connection.volume + "`",
                                                            "color": 16684873,
                                                            "thumbnail": {
                                                                "url": bot.user.avatarURL
                                                            },
                                                            "author": {
                                                                "name": "Tomoko Bot",
                                                                "icon_url": bot.user.avatarURL
                                                            }
                                                        }
                                                    });
            } else {
                invalidArgs(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Music Player",
                                            "description": "I'm n-not in y-your voice channel!\nP-Please use `join`!",
                                            "color": 16684873,
                                            "thumbnail": {
                                                "url": bot.user.avatarURL
                                            },
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            }
                                        }
                                    });
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

/**
 *
 * ACTION COMMANDS
 * MISSING: bite, bloodsuck, holdhands, stare, smile, blush, sleepy, dance, cry, eat, highfive
 *
**/

async function pat(sender, target, channelId) {
    var pat = await neko.getSFWPat();
    logger.info(pat);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been patted by **" + sender.nick + "**",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": pat.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("pat", (message, args) => { // Pat command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                pat(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function hug(sender, target, channelId) {
    var hug = await neko.getSFWHug();
    logger.info(hug);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been hugged by **" + sender.nick + "** :heart:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": hug.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("hug", (message, args) => { // Hug Command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                hug(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function kiss(sender, target, channelId) {
    var kiss = await neko.getSFWKiss();
    logger.info(kiss);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been kissed by **" + sender.nick + "** :heart:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": kiss.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("kiss", (message, args) => { // Kiss Command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                kiss(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function slap(sender, target, channelId) {
    var slap = await neko.getSFWSlap();
    logger.info(slap);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been slapped by **" + sender.nick + "** :punch:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": slap.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("slap", (message, args) => { // Slap Command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                slap(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function tickle(sender, target, channelId) {
    var tickle = await neko.getSFWTickle();
    logger.info(tickle);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been tickled by **" + sender.nick + "** :joy:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": tickle.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("tickle", (message, args) => { // Tickle Command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                tickle(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function cuddle(sender, target, channelId) {
    var cuddle = await neko.getSFWCuddle();
    logger.info(cuddle);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been cuddled by **" + sender.nick + "** :heart:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": cuddle.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("cuddle", (message, args) => { // Cuddle Command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                cuddle(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function meow(sender, channelId) {
    var meow = await neko.getSFWMeow();
    logger.info(meow);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Meow :cat:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": meow.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("meow", (message, args) => { // Meow Command
    if (args.length === 0) {
        meow(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function poke(sender, target, channelId) {
    var poke = await neko.getSFWPoke();
    logger.info(poke);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been poked by **" + sender.nick + "** :eyes:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": poke.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("poke", (message, args) => { // Poke Command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                poke(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function smug(sender, channelId) {
    var smug = await neko.getSFWSmug();
    logger.info(smug);
    bot.createMessage(channelId, {
        "embed": {
            "title": "You can be proud of yourself :trophy:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": smug.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("smug", (message, args) => { // Smug Command
    if (args.length === 0) {
        smug(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function baka(sender, channelId) {
    var baka = await neko.getSFWBaka();
    logger.info(baka);
    bot.createMessage(channelId, {
        "embed": {
            "title": "BAAAKAAAA! :mega:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": baka.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("baka", (message, args) => { // Baka Command
    if (args.length === 0) {
        baka(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function feed(sender, target, channelId) {
    var feed = await neko.getSFWFeed();
    logger.info(feed);
    bot.createMessage(channelId, {
        "embed": {
            "title": "**" + target + "** you have been feeded by **" + sender.nick + "** :fork_and_knife:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": feed.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("feed", (message, args) => { // Feed Command
    if (args.length === 1) {
        if (message.mentions.length === 1) {
            if (!(message.mentionEveryone)) {
                feed(message.member, message.mentions[0].username, message.channel.id);
            } else {
                warnEveryone(message, message.author, message.content.split(" ")[0]);
            }
        } else {
            invalidArgs(message, message.author, message.content.split(" ")[0]);
        }
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function f_neko(sender, channelId) {
    var i_neko = await neko.getSFWNeko();
    logger.info(i_neko);
    bot.createMessage(channelId, {
        "embed": {
            "title": "NEKOS! :cat: :heart:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": i_neko.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("neko", (message, args) => { // Neko Command
    if (args.length === 0) {
        f_neko(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});


async function nekogif(sender, channelId) {
    var nekogif = await neko.getSFWNekoGif();
    logger.info(nekogif);
    bot.createMessage(channelId, {
        "embed": {
            "title": "NEKO GIFS! :cat: :heart:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": nekogif.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("nekogif", (message, args) => { // NekoGIF Command
    if (args.length === 0) {
        nekogif(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});



/**bot.registerCommand("bite", (message, args) => { // Bite Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("bloodsuck", (message, args) => { // Bloodsuck Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("holdhands", (message, args) => { // Holdhands Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("stare", (message, args) => { // Stare Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("smile", (message, args) => { // Smile Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("blush", (message, args) => { // Blush Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("sleepy", (message, args) => { // Sleepy Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("dance", (message, args) => { // Dance Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("cry", (message, args) => { // Cry Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("eat", (message, args) => { // Eat Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

/**bot.registerCommand("highfive", (message, args) => { // High Five Command
    if (args.length === 0) {
        weebShHint(message.author, message.channel.id, message.content.split(" ")[0].replace("*", ""));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

async function foxgirl(sender, channelId) {
    var foxgirl = await neko.getSFWFoxGirl();
    logger.info(foxgirl);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Here's a foxgirl for you :fox:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": foxgirl.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("foxgirl", (message, args) => { // Fox girl Command
    if (args.length === 0) {
        foxgirl(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});

async function kemonomimi(sender, channelId) {
    var kemonomimi = await neko.getSFWKemonomimi();
    logger.info(kemonomimi);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Here's a kemonomimi image for you :dancers:",
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "image": {
                "url": kemonomimi.url
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the GIF as embed.
}

bot.registerCommand("kemonomimi", (message, args) => { // Kemonomimi Command
    if (args.length === 0) {
        kemonomimi(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 6000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 5
});

/**
 *
 * CURRENCY COMMANDS
 *
**/



/**
 *
 * FUN COMMANDS
 *
**/

async function askTheEightBall(sender, channelId, question) {
    var answer = await neko.getSFW8Ball(question);
    logger.info(answer);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Magic 8 Ball :8ball:",
            "description": sender.mention + ", " + answer.response,
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with the answer as embed.
}

bot.registerCommand("8ball", (message, args) => { // Command to aks the 8ball something
    if (args.length >= 1) {
        askTheEightBall(message.member, message.channel.id, args.join(' '));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

async function fact(sender, channelId) {
    var fact = await neko.getSFWFact();
    logger.info(fact);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Tomoko's Facts :bulb:",
            "description": fact.fact,
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with a fact as embed.
}

bot.registerCommand("fact", (message, args) => { // Command to get a random fact
    if (args.length === 0) {
        fact(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("catfact", (message, args) => { // Catfact command
    if (args.length === 0) {
        var factId = Math.floor(Math.random() * catfacts.facts.length); // Generate a random number
        bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Catfacts :cat: :bulb:",
                                            "description": catfacts.facts[factId],
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                        }); // Send a message with a very bad joke as embed
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("joke", (message, args) => { // Joke command
    if (args.length === 0) {
        var jokeId = Math.floor(Math.random() * jokes.jokes.length); // Generate a random number
        bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Jokes :stuck_out_tongue_winking_eye:",
                                            "description": jokes.jokes[jokeId],
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                        }); // Send a message with a very bad joke as embed
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("coinflip", (message, args) => { // Coin flip
    if (args.length === 0) {
        var result = Math.floor(Math.random() * 2); // Generate a random number
        var sresult = "";
        if (result === 0) {
            sresult = "Head";
        } else if (result === 1) {
            sresult = "Tail";
        } else {
            bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's Coin Flip",
                                                "description": "Y-You got a... W-What? The c-coin d-disappeared!\nJ-Just kidding, t-this is an e-error. Y-You may r-report this o-on my o-official Discord S-Server",
                                                "color": 16684873,
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "footer": {
                                                    "icon_url": message.author.avatarURL,
                                                    "text": "Requested by: " + getUserName(message.member)
                                                }
                                            }
                                            }); // Send a message with the coin flip result
            return;
        }
        bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Coin Flip",
                                            "description": "T-The result is:\n:dvd: " + sresult + "!",
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                        }); // Send a message with the coin flip result
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommandAlias("coin", "coinflip"); // Register command alias for lazy people

bot.registerCommand("rolldice", (message, args) => { // Roll a (virtual) dice
    if (args.length === 0) {
        var result = Math.floor(Math.random() * 6); // Generate a random number
        bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Dice",
                                            "description": "T-The result is:\n:game_die: " + (result + 1) + "!",
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                        }); // Send a message with the dice result
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommandAlias("dice", "rolldice"); // Register command alias for lazy people

async function why(sender, channelId) {
    var why = await neko.getSFWWhy();
    logger.info(why);
    bot.createMessage(channelId, {
        "embed": {
            "title": "Tomoko's Random Questions :question:",
            "description": why.why,
            "color": 16684873,
            "author": {
                "name": "Tomoko Bot",
                "icon_url": bot.user.avatarURL
            },
            "footer": {
                "icon_url": sender.avatarURL,
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with a fact as embed.
}

bot.registerCommand("why", (message, args) => { // Command to get a random fact
    if (args.length === 0) {
        why(message.member, message.channel.id);
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

async function owo(sender, channelId, text) {
    var owo = await neko.getSFWOwOify({ text: text });
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
                "text": "Powered by: nekos.life, Requested by: " + sender.nick
            }
        }
    }); // Send a message with owoified text as embed
}

bot.registerCommand("owoify", (message, args) => { // Command to owoify a text
    if (args.length >= 1) {
        owo(message.member, message.channel.id, args.join(" "));
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommandAlias("owofy", "owoify"); // Register command alias for lazy people

bot.registerCommand("lovemeter", (message, args) => { // LOVEMETER 3000 PRO 2.0
    if (message.mentionEveryone) {
        warnEveryone(message, message.author, message.content.split(" ")[0]);
        return;
    }
    var user1;
    var user2;
    if (message.mentions.length === 1) {
        user1 = message.author;
        user2 = message.mentions[0];
    } else if (message.mentions.length === 2) {
        user1 = message.mentions[0];
        user2 = message.mentions[1];
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
        return;
    }
    var love = 0;
    if (user1 == bot.user || user2 == bot.user) {
        if (user1.id === config.ownerId || user2.id === config.ownerId) {
            love = 100;
        } else {
            love = (user1.discriminator + user2.discriminator) % 101;
        }
    } else {
        love = (user1.discriminator + user2.discriminator) % 101;
    }
    var comment = "Oh, if you can see this, an error occured, lol.";
    if (love < 20) {
        comment = "Wow, you two should stay away from each other...";
    } else if (love < 45) {
        comment = "Not so good.";
    } else if (love < 62) {
        comment = "Kinda good, but far from perfect.";
    } else if (love < 80) {
        comment = "Pretty good, this could be worth a try.";
    } else if (love > 89) {
        comment = "A Real love!";
    }
    bot.createMessage(message.channel.id, {
                                        "embed": {
                                            "title": "Tomoko's Ultra Love Meter 3000 Pro 2.0 Mega Edition :heart:",
                                            "description": "R-Result for " + user1.username + " a-and " + user2.username + ":\n" + love + "%! " + comment,
                                            "color": 16684873,
                                            "author": {
                                                "name": "Tomoko Bot",
                                                "icon_url": bot.user.avatarURL
                                            },
                                            "footer": {
                                                "icon_url": message.author.avatarURL,
                                                "text": "Requested by: " + getUserName(message.member)
                                            }
                                        }
                                        }); // Send a message with the love meter result
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommandAlias("love", "lovemeter"); // Register command alias for lazy people

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

bot.registerCommand("anime", (message, args) => { // Command to get info about an anime
    if (args.length >= 1) {
        var searchQuery = args.join(" ");
        var query = `
        query ($id: Int, $page: Int, $perPage: Int, $search: String) {
            Page (page: $page, perPage: $perPage) {
                pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }
                media (id: $id, search: $search) {
                    id
                    format
                    episodes
                    duration
                    averageScore
                    genres
                    startDate {
                        day
                        month
                        year
                    }
                    endDate {
                        day
                        month
                        year
                    }
                    title {
                        english
                        romaji
                        native
                    }
                }
            }
        }
        `;
        var variables = {
            search: searchQuery,
            page: 1,
            perPage: 9,
            format: "TV"
        };
        var url = "https://graphql.anilist.co",
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
        fetch(url, options).then(handleResponse).then((data) => {
            console.log(data);
            console.log(data.data);
            console.log(data.data.Page);
            console.log(data.data.Page.pageInfo);
            console.log(data.data.Page.media);

        }).catch((err) => { logError(err, message.member.shard.id); });
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

bot.registerCommand("rps", (message, args) => { // Rock-paper-scissors game
    if (args.length === 1) {
        var id = Math.floor(Math.random() * 4); // Generate a random number
        var iChose = rpsData.rock;
        if (id === rpsData.paper.id) {
          iChose = rpsData.paper;
        }
        if (id === rpsData.scissors.id) {
          iChose = rpsData.scissors;
        }
        var userChose = undefined;
        if (rpsData.rock.forms.indexOf(args[0]) !== -1) {
          userChose = rpsData.rock;
        }
        if (rpsData.paper.forms.indexOf(args[0]) !== -1) {
          userChose = rpsData.paper;
        }
        if (rpsData.scissors.forms.indexOf(args[0]) !== -1) {
          userChose = rpsData.scissors;
        }
        if (userChose === undefined) {
          bot.createMessage(message.channel.id, {
                                              "embed": {
                                                  "title": "Tomoko's RPS",
                                                  "description": ":x: Error: Invalid argument `" + args[0] + "`!\nPlease check your spelling.",
                                                  "color": 16684873,
                                                  "author": {
                                                      "name": "Tomoko Bot",
                                                      "icon_url": bot.user.avatarURL
                                                  },
                                                  "footer": {
                                                      "icon_url": message.author.avatarURL,
                                                      "text": "Requested by: " + getUserName(message.member)
                                                  }
                                              }
                                            }); // Send a message with the error.
          return;
        }
        var iWon = false;
        var userWon = false;
        var tie = false;
        if (iChose.id === userChose.id) {
          iWon = false;
          userWon = false;
          tie = true;
        }
        if (iChose.winsAgainst === userChose.id) {
          iWon = true;
          userWon = false;
          tie = false;
        }
        if (iChose.losesAgainst === userChose.id) {
          iWon = false;
          userWon = true;
          tie = false;
        }
        var message = "Whoops. Something went wrong here, sorry.";
        if (iWon === true) {
          message = "I win!"
        }
        if (userWon === true) {
          message = "You win!"
        }
        if (tie === true) {
          message = "It's a tie!"
        }
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's RPS",
                                                "description": "I'm choosing **" + iChose.name + "**! " + message,
                                                "color": 16684873,
                                                "author": {
                                                    "name": "Tomoko Bot",
                                                    "icon_url": bot.user.avatarURL
                                                },
                                                "footer": {
                                                    "icon_url": message.author.avatarURL,
                                                    "text": "Requested by: " + getUserName(message.member)
                                                }
                                            }
                                          }); // Send a message with the rps result
    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});

/**bot.registerCommand("name", (message, args) => { // Command template
    if (args.length === 0) {

    } else {
        invalidArgs(message, message.author, message.content.split(" ")[0]);
    }
},
{
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
});**/

bot.on("guildMemberAdd", (guild, member) => { // When an user joins the server
    logger.info("Join event called!"); // Log "Join event called!",
    logger.info("Guild name: " + guild.name + " (ID: " + guild.id + ")"); // the guild name
    logger.info("User name: " + member.username); // and the username
    var welcomeMsgId = Math.floor(Math.random() * messages.welcome.length); // Generate a random number
    bot.createMessage(guild.systemChannelID, messages.welcome[welcomeMsgId]); // Send a random welcome message
});

bot.on("guildCreate", (guild) => { // On a new guild
    logger.info("New guild!"); // Log message
    logger.info("Guild name: " + guild.name + " (ID: " + guild.id + ")"); // the guild name
    logger.info("Icon URL: " + guild.iconURL)
    bot.createMessage(config.guildUpdateChannelId, {
                                                "embed": {
                                                    "title": "New Guild in Shard #" + guild.shard.id + "!",
                                                    "description": "Name: **" + guild.name + "**\nMember Count: **" + guild.members.size + "**",
                                                    "color": 16684873,
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "thumbnail": {
                                                        "url": guild.iconURL
                                                    }
                                                }
                                            }); // Send a message
});

bot.on("guildDelete", (guild) => { // On a lost guild
    logger.info("Lost guild!"); // Log message
    logger.info("Guild name: " + guild.name + " (ID: " + guild.id + ")"); // the guild name
    logger.info("Icon URL: " + guild.iconURL)
    bot.createMessage(config.guildUpdateChannelId, {
                                                "embed": {
                                                    "title": "Lost Guild in Shard #" + guild.shard.id + "!",
                                                    "description": "Name: **" + guild.name + "**\nMember Count: **" + guild.members.size + "**",
                                                    "color": 16684873,
                                                    "author": {
                                                        "name": "Tomoko Bot",
                                                        "icon_url": bot.user.avatarURL
                                                    },
                                                    "thumbnail": {
                                                        "url": guild.iconURL
                                                    }
                                                }
                                            }); // Send a message
});

bot.on("messageCreate", (message) => { // When a message is created
    // First off, if the message mentions me,
    // send a random mention message
    if (message.content === bot.user.mention) {
        var mentionMsgId = Math.floor(Math.random() * messages.mention.length); // Generate a random number
        bot.createMessage(message.channel.id, messages.mention[mentionMsgId].replace("$user", message.author.mention)); // Send a random mention message
    } else if (message.mentions.includes(bot.user) && !(message.mentionEveryone)) {
         chat(message.channel.id, message.content.replace(bot.user.mention + " ", "")); // Call the function to get a SFW chat from nekos.life
    }
    /**if (message.content == "*shutdown") { // Used for some little testing. Senseless.
        if (message.member.permission.has("administrator")) {
            message.channel.guild.shard.disconnect();
        } else {
            noPermission(message, message.author, message.content.split(" ")[0]);
        }
    }**/
});

// Get the bot to connect to Discord
bot.connect();
