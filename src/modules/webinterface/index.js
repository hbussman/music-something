"use strict";
const express = require("express");
const router = express.Router();
const path = require("path");

class webinterface{
	/**
     * 
     * @param {Music} music 
     * @param {*} logger 
     * @param {*} config 
     */
	constructor(music,logger,config){
		this._music = music;
		this._logger = logger;
		this._config = config;
	}

	get router(){

		router.use(express.static(path.join(__dirname,"res")));

		//Jquery
		router.use("/js", express.static(path.join(require.resolve("jquery"),"..")));

		//Bootstrap
		router.use(express.static(path.join(require.resolve("bootstrap"), "..","..")));

		//Vue
		router.use("/js", express.static(path.join(require.resolve("vue"), "..")));

		/*	
		 * 	Sends the login mask
 		 *  Method: GET
    	 *  Path: /login
    	 */
		router.get("/login", function (req, res) {
			req.app.locals.checkLogin(req, res, function () {
				res.redirect("/");
			}, function () {
				res.sendFile(path.join(__dirname, "login.html"));
			});
		});

		/*
		 *	Get the index page (main page)
    	 *  Method: GET
    	 *  Path: /
    	 */
		router.get("/", function (req, res) {
			req.app.locals.checkLogin(req, res, function () {
				res.sendFile(path.join(__dirname, "index.html"));
			}, function () {
				res.redirect("/login");
			});

		});

		/*
		 *	For creating a new account via the webinterface
		 *	Method: POST
		 *	Path: /backend/register
		 */
		router.post("/backend/register", function (req, res) {
			req.app.locals.checkLogin(req, res, function () {
				res.redirect("/");
			}, function () {
				this._music.addUser(req.body.username, req.body.password, function (err) {
					if (err) {
						//TODO log err / notify user properly
                        res.status(500).send(err.message)
					} else {
						// log the user in right away
                        this._music.loginCheck(req.body.username, req.body.password, function (err, result, user) {
                            if (err) {
                                //TODO log err
                                throw err;
                            } else if (result) {
                                req.session.user = user;
                                res.redirect("/");
                            } else {
                                res.redirect("/login");
                            }
                        });
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));

		/*
		 *	For logging in via the webinterface
    	 *  Method: POST
    	 *  Path: /backend/login 
    	 */
		router.post("/backend/login", function (req, res) {
			req.app.locals.checkLogin(req, res, function () {
				res.redirect("/");
			}, function () {
				this._music.loginCheck(req.body.username, req.body.password, function (err, result, user) {
					if (err) {
					//TODO log err
						throw err;
					} else if (result) {
						req.session.user = user;
						res.redirect("/");
					} else {
						res.redirect("/login");
					}
				});
			}.bind(this));
		}.bind(this));

		/*
		 *	Loggin out. Destroys session
    	 *  Method: GET
    	 *  Path: /backend/logout 
    	 */
		router.get("/backend/logout", function (req, res) {
			req.session.destroy();
			res.redirect("/login");
		});

		return router;
	}

}

module.exports = webinterface;
