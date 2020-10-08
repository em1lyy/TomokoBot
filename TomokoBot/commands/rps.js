module.exports.run = (message, args) => { // Rock-paper-scissors game
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
        var retmessage = "Whoops. Something went wrong here, sorry.";
        if (iWon === true) {
          retmessage = "I win!";
        }
        if (userWon === true) {
          retmessage = "You win!";
        }
        if (tie === true) {
          retmessage = "It's a tie!";
        }
        bot.createMessage(message.channel.id, {
                                            "embed": {
                                                "title": "Tomoko's RPS",
                                                "description": "I'm choosing **" + iChose.name + "**! " + retmessage,
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
};

module.exports.options = {
    "cooldown": 4000,
    "cooldownMessage": messages.cooldown,
    "cooldownReturns": 4
};
