const Eris = require("eris");
const logger = require("winston");
const auth = require("auth.json");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Eris object
var bot = new Eris.Client(auth.token);
