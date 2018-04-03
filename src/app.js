"use strict";
const MusicSomething = require("./lib/MusicSomething");
const dbModule = require("./lib/DbMongo");
const ConfigLoader = require("./lib/ConfigManager");
const StorageManager = require("./lib/StorageManager");

const winston = require("winston");
const path = require("path");

//Modules
const webserver = require("./modules/webserver");
const webinterface = require("./modules/webinterface");
const yt = require("./modules/yt");

const confMan = new ConfigLoader(path.join(__dirname, "..", "config", "config.json"), [webserver, dbModule, StorageManager, yt]);


// load the config and start
confMan.loadOrCreate(function (config, err) {
    if(err) {
        throw err;
    }

    const storage = new StorageManager(config);
    storage.init();

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
            new winston.transports.File({filename: path.join(storage.storageDirs.LOGS, "combined.log"), json: false}),
            new winston.transports.File({
                filename: path.join(storage.storageDirs.LOGS, "error.log"),
                level: "error",
                json: false
            })
        ]
    });

    if (process.env.NODE_ENV == "development") {
        logger.add(new winston.transports.Console());
    }

    //Create and start the app

    let app = new MusicSomething(config, storage, dbModule, [
        webserver,
        webinterface,
        yt
    ], logger);

    app.start();
});