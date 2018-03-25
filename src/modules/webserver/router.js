"use strict";
const express = require("express");
const router = express.Router();
const path = require("path");

module.exports = function (app, music, logger, config) {

	router.get("/api/songs", function (req, res) {
		app.locals.checkLogin(req, res, function () {
			music.getSongs(req.body, function (err, result) {
				if (err) {
					res.status(500).send();
					throw err;
				} else {
					res.json(result);
				}
			});
		});

	});

	/*
    *   Get info about a spesific song
    *   Method: GET
    *   Path: /api/songs/:id
    */
	router.get("/api/songs/:id", function (req, res) {
		app.locals.checkLogin(req, res, function () {
			music.getSong(req.params.id, function (err, result) {
				if (err) {
					res.status(500).send();
					throw err;
				}else if(!result){
					res.status(404).send();
				} else {
					res.json(result);
				}
			});
		});
	});

	/*
	*	Get the File of the song
    *   Method: GET
    *   Path: /api/songs/:id/file
    */
	router.get("/api/songs/:id/file", function (req, res) {
		app.locals.checkLogin(req, res, function () {
			music.getSongFilePath(req.params.id, function (err, result) {
				if (err) {
					res.status(500).send();
					throw err;
				} else {
					res.sendFile(result);
				}
			});
		});

	});

	/*
	*	Updates infor about the song and changes Folder name if necessary
    *   Method: PATCH
    *   Path: /api/songs/:id
    */
	router.patch("/api/songs/:id", function (req, res) {
		app.locals.checkLogin(req, res, function () {
			music.updateSong(req.params.id, req.body, function (err) {
				if (err) {
					res.status(500).send();
					throw err;
				} else {
					res.send();
				}
			});
		});
	});

	/*
	*	Delets the song from DB, remove song from path and delete if the it's empty 
    *   Method: DELETE
    *   Path: /api/songs/:id
    */
	router.delete("/api/songs/:id", function (req, res) {
		app.locals.checkLogin(req, res, function () {
			music.deleteSong(req.params.id, function (err) {
				if (err) {
					res.status(500).send();
					throw err;
				} else {
					res.send();
				}
			});
		});
	});

	/*
	*	Uploads a song, and stores it
    *   Method: POST
    *   Path: /api/songs
    */
	router.post("/api/songs/", function (req, res) {
		
		app.locals.checkLogin(req, res, function () {
			var folder = path.join(config.dataPath, "tmp");
			var songPath = path.join(folder, req.files.file.name);
			req.files.file.mv(songPath, function (err) {
				music.addFile(songPath, req.body, function (err) {
					if (err) {
						res.status(500).send();
						throw err;
					} else {
						res.send();
					}
				});
			});
		});
	});

	/*
	*	Gets all artists 
    *   Method: GET
    *   Path: /api/artists
    */
	router.get("/api/artists/", function (req, res) {
		app.locals.checkLogin(req, res, function () {
			music.getArtists(function (err, result) {
				if (err) {
					//err
					res.status(500).send();
					throw err;
				} else {
					res.json(result);
				}
			});
		});
	});

	/*
	*	Gets all albums 
    *   Method: GET
    *   Path: /api/albums
    */
	router.get("/api/albums/", function (req, res) {
		app.locals.checkLogin(req, res, function () {
			music.getAlbums(function (err, result) {
				if (err) {
				//err
					res.status(500).send();
					throw err;
				} else {
					res.json(result);
				}
			});
		});
	});

	router.post("/api/authenticate", function (req, res) {
		//TODO
		var username = req.body.username;
		var password = req.body.password;

		music.loginCheck(username, password, function (err, success, info) {
			if (err) {
				//err
				throw err;
			} else if (!success) {
				
			} else {
				jwt.sign(info,
					config.jwtSecret,
					{
						expiresIn: "5h"
					},
					function (err, result3) {
						if (err) {
							res.json({
								success: false,
								errMsg: "Failed to validate jwt",
								err: err
							});
						} else {
							res.json({
								success: true,
								token: result3
							});
						}
					});
			}
		});
	});

	router.get("/api/users", function (req, res) {
		app.locals.checkLogin(req,res,function(){
			music.getAllUsers(function(err,result){
				if(err){
					//err
					throw err;
				}else{
					res.json(result);
				}
			});
		});
	});

	router.post("/api/users", function (req, res) {
		app.locals.checkLogin(req,res,function(){
			music.addUser(req.body.username,req.body.password,function(err){
				if(err){
					//err
					throw err;
				}else{
					res.send();
				}
			});
		});
	});

	router.patch("/api/users/:username", function (req, res) {
		//TODO
	});

	router.delete("/api/users/:username", function (req, res) {
		//TODO
	});

	return router;
};