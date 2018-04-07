"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const fileupload = require("express-fileupload");
const jwt = require("jsonwebtoken");

class Webserver {

	constructor(music, logger, config) {
		this._logger = logger;
		this._music = music;
		this._config = config;

		let log = function (req, res, next) {
			logger.verbose(req.ip + " " + req.method + " " + req.originalUrl);
			next();
		};

		/**
		 * Check if login is valid. If no sends 401, if yes calls callback
		 * @param {*} req
		 * @param {*} res
		 * @param {*} cbS - callback if is logged in
		 * @param {*} cbF - callback if not logged in. If not defined a 401 error is send back
		 */
		let checkLogin = function (req, res, cbS, cbF) {
			var token = req.query.accessToken || req.get("x-access-token");
			if (token) {
				jwt.verify(token, config.jwtSecret, function (err, result) {
					if (err) {
						//err
						res.status(500).send();
					} else if (result) {
						req.user = result.username;
						typeof cbS === "function" && cbS();
					} else {
						(typeof cbF === "function") ? cbF() : res.status(401).send();
					}
				});

			} else if (req.session && req.session.user) {
				req.user = req.session.user;
				typeof cbS === "function" && cbS();
			} else {
				(typeof cbF === "function") ? cbF() : res.status(401).send();
			}
		};

		this._app = express();

		this._app.locals.checkLogin = checkLogin;

		this._app.use(log);

		this._app.use(bodyParser.json());

		this._app.use(bodyParser.urlencoded({
			extended: false
		}));

		this._app.use(session({
			secret: config.webserver.sessionSecret,
			resave: false,
			saveUninitialized: true,
		}));

		this._app.use(fileupload());

		this._app.use(require(path.join(__dirname, "router.js"))(this._app, music, logger, config));

	}

	static getConfigTemplate() {
		return {
			section: "webserver",
			description: "Options related to the internal webserver",
			elements: [
				{
					option: "port",
					description: "Port to listen on",
					standard: "80"
				},
				{
					option: "sessionSecret",
					description: "Session secret, keep it secret!"
				},
				{
					option: "jwtSecret",
					description: "No idea what this is, might even be unused." // TODO no gud
				},
			]
		};
	}

	init(allMoules, callback) {
		/**
		 * Handles 404 error
		 */
		var four0four = function (req, res) {
			res.status(404);
			res.send("404");
		};

		/**
		 * Handles general errors
		 */
		var errorHandle = function (err, req, res) {

			this._logger.error("Webserver error: " + err);
			//TODO: propper error response
			res.status(500).json({
				errMsg: "Upps",
				err: err.stack
			});
		};

		allMoules.forEach(function (element) {
			if (typeof element.router !== "undefined") {
				this._app.use(element.router);
			}
		}, this);

		this._app.use(four0four);
		this._app.use(errorHandle);

		this._app.listen(this._config.webserver.port, function () {
			this._logger.info("Webserver running on port: " + this._config.webserver.port);
			callback(null);
		}.bind(this));
	}


}

module.exports = Webserver;