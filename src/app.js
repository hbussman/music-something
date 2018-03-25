"use strict";
const MusicSomething = require("./lib/MusicSomething");
const dbModule = require("./lib/DbMongo");

const winston = require("winston");
const fs = require("fs");
const path = require("path");

//Modules
const webserver = require("./modules/webserver");
const webinterface = require("./modules/webinterface");
const yt = require("./modules/yt");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config", "config.json")));

//create logger
const myFormat = winston.format.printf(info => {
	return `[${info.level}] ${info.timestamp} : ${info.message}`;
});

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp(),
		myFormat
	),
	transports: [
		new winston.transports.File({ filename: path.join(__dirname, "..", "log", "combined.log"), json: false }),
		new winston.transports.File({ filename: path.join(__dirname, "..", "log", "error.log"), level: "error", json: false })
	]
});

if (process.env.NODE_ENV == "development") {
	logger.add(new winston.transports.Console());
}

//Create and start the app

let app = new MusicSomething(config,dbModule,[
	webserver,
	webinterface,
	yt
],logger);

app.start();
