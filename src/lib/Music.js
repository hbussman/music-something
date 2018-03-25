"use strict";
const path = require("path");
const mm = require("music-metadata");
const fs = require("fs");
const bcrypt = require("bcrypt");
const Metadata = require("./Metadata");

const Song = require("./Song");


class Music{
	/**
	 * Constructor
	 * @param {DbBase} dbDriver - Database driver
	 * @param {*} config 
	 * @param {*} logger 
	 */
	constructor(dbDriver,config,logger){
		this._db = dbDriver;
		this._config = config;
		this._logger = logger;
	}

	/**
     * Get all songs with searchattributes or leave empty for all songs
     * @param {Object} filter - filter 
     * @param {Music~getSongsCallback} callback - callback
     */
	getSongs(filter, callback){
		this._db.getSongs(filter,function(err,result){
			if(err){
				//TODO: log err
				callback(err,null);
			}else{
				callback(null,result);
			}
		});
	}

	/**
     * Get info about a spesific song
     * @param {string} id - The id of the song e.g. "5a20817dfb9bdd3195d52889"  
     * @param {Music~getSongCallback} callback - callback
     */
	getSong(id, callback){
		this._db.getSong(id,function(err,result){
			if(err){
				//TODO: log error
				callback(err,null);
			}else{
				callback(null,result);
			}
		});
	}

	/**
     * Absoulte filepath of the file of a song
     * @param {string} id - The id of the song e.g. "5a20817dfb9bdd3195d52889" 
     * @param {Music~getSongFilePathCallback} callback - callback
     */
	getSongFilePath(id, callback) {
		this._db.getSong(id,function(err,result){
			if(err){
				//TODO: log error
				callback(err,null);
			}else{
				let fullPath = this._getAbsoluteFilePath(result.file);
				callback(null,fullPath);
			}
		}.bind(this));
	}

	_getAbsoluteFilePath(relativePath){
		return path.join(this._config.dataPath,relativePath);
	}

	/**
     * Get all the existing Artists
     * @param {Music~getArtistCallback} callback -Callback 
     */
	getArtists(callback) {
		this._db.getArtists(function(err,result){
			if(err){
				//TODO: log error
				callback(err,null);
			}else{
				callback(null,result);
			}
		});
	}

	/**
     * Get all the existing Albums
     * @param {Music~getAlbumsCallback} callback - Callback
     */
	getAlbums (callback) {
		this._db.getAlbums(function(err,result){
			if(err){
				//TODO: log error
				callback(err,null);
			}else{
				callback(null,result);
			}
		});
	}

	/**
     * Add a new file to the libary
     * @param {string} filePath - path to the file to add
     * @param {Song} songAttributes - Override attributes when adding (not all supported)
     * @param {errCallback} callback - Callback
     */
	addFile(filePath, overideMetadata, callback) {
		let filename = path.basename(filePath);

		this.getMetadata(filePath, function (err, fileMetadata,duration) {
			if(err){
				//TODO: log error
			}else{
				//If there was no title in the metadata the use the filename
				if (!fileMetadata.title) {
					fileMetadata.title = filename.replace(/\.[^/.]+$/, "").trim();
				}

				fileMetadata.overideWith(overideMetadata);

				//Create Song
				let newSong = new Song({
					duration,
					metadata:fileMetadata
				});

				//Save this song into the system
				this.saveSong(filePath,newSong,function(){

					if (err) {
						//TODO: log error
						callback(err);
					} else {
						//add new song to db
						this._db.addSong(newSong, callback);
					}
				}.bind(this));

			}
		}.bind(this));
	}

	/**
     * Update Metadata
     * @param {string} id - ID of the song you want to update
     * @param {Song} newSongAttributes - Attributes you want to change
     * @param {errCallback} callback - Callback
     */
	updateSong (id, newMetadata, callback) {
		this.getSong(id, function (err, result) {
			if (err) {
				//TODO: log error
				callback(err);
			} else {
				result.metadata = newMetadata;
				this.saveSong(this._getAbsoluteFilePath(result.file),result , function (err, newSong) {
					this._db.updateSong(newSong, function (err) {
						if(err){
							//TODO: log error
							callback(err);
						}else{
							this._deleteEmtyDir(path.join(this._getAbsoluteFilePath(result.file), ".."), function (err) {
								if(err){
									//TODO: log error
								}
								callback(err);
							});
						}
					
					}.bind(this));
				}.bind(this));
			}
		}.bind(this));
	}

	/**
     * 
     * @param {string} id - ID of the song you want to delete
     * @param {errCallback} cb - Callback
     */
	deleteSong (id, callback) {
		this._db.getSong(id, function (err, result) {
			if (err) {
				callback(err);
			} else if (!result) {
				callback(new Error("Song dosn't exist"));
			} else {
				fs.unlink(path.join(this._config.dataPath, result.file), function (err) {
					if (!err) {
						this._db.removeSong(id, function (err) {
							if (err) {
								callback(err);
							} else {
								this._deleteEmtyDir(path.join(this._config.dataPath, result.file, ".."), function (err) {
									callback(err);
								});
							}

						}.bind(this));
					} else {
						this._deleteEmtyDir(path.join(this._config.dataPath, result.file, ".."), function (err) {
							callback(err);
						});
					}
				}.bind(this));
			}
		}.bind(this));
	}

	/**
     * Reads metadata from a audio file
     * @param {string} filePath - path of the file you want to read the metadat from
     * @param {Music~getMetadataCallback} callback - Callback
     */
	getMetadata (filePath, callback) {
		mm.parseFile(filePath, {
			duration: true
		}).then(function (metadata) {
			let newMetadata = new Metadata();
			newMetadata.getMetadataFromMusicMetadata(metadata);

			let duration = Math.round(metadata.format.duration);

			callback(null, newMetadata,duration);

		}).catch(function (err) {
			callback(err,null,null);
		});
	}

	/**
     * Moves song into the right directory. Dosn't change the database entry.
	 * @param {Song} song
     * @param {Music~saveSongCallback} callback - Callback
     */
	saveSong (filePath,song, callback) {

		let filename = path.basename(filePath);
		let artistPath = path.join(this._config.dataPath, "music", (song.metadata.artist) ? song.metadata.artist : "Unknown Artist");
		this._createIfNotExists(artistPath, function (err) {
			if(err){
				//TODO: log error
				callback(err,null);
			}else{
				let albumPath = path.join(artistPath, (song.metadata.album) ? song.metadata.album : "Unknown Album");
				this._createIfNotExists(albumPath, function (err) {
					if(err){
						//TODO: log error
						callback(err,null);
					}else{
						this._findGoodFilename(albumPath, filename, song, function (err, finalPath) {
							if(err){
								//TODO: log error
								callback(err,null);
							}else{
								//copy song to final dir
								fs.rename(filePath, finalPath, function (err) {
									if (err) {
										//TODO: log error
										callback(err,null);
									} else {
										song.file = path.relative(this._config.dataPath, finalPath);
										//All done here
										callback(err, song);
									}
								}.bind(this));
							}
						}.bind(this));
					}
				}.bind(this));
			}
		}.bind(this));
	}

	_createIfNotExists (dirPath, callback) {
		fs.stat(dirPath, function (err, stats) {
			if (err) {
				//Directory doesn't exist or something. Sooo create it then
				//TODO: check if the error is a "not found" error
				fs.mkdir(dirPath, function (err) {
					callback(err);
				});
			} else if (!stats.isDirectory()) {
				// This isn't a directory! shouldn't happen
				callback(new Error("path is not a directory"));
			} else {
				//Folder already exists. Cool.
				callback(null);
			}
		});
	}

	_findGoodFilename (albumPath, filename, song, callback) {
		//Get Fileextention e.g. ".mp3"
		let fileExt = /(?:\.([^.]+))?$/.exec(filename)[0];
		//Generate base filename e.g. "titleOfSong" or "filenameWithoutExtention" if no title is set.
		let tmpFilename = (song.metadata.title) ? song.metadata.title : filename.replace(/\.[^/.]+$/, "");

		let i = 0;
		let counter = "";

		var findFilename = function (err) {
			if (!err) {
				//file already exists
				i++;
				//generate new filename e.g. title (1).mp3
				counter = "(" + i + ")";
				//And try again
				fs.stat(path.join(albumPath, tmpFilename + counter + fileExt), findFilename);
			} else if (err.code == "ENOENT") {
				//File dosn't exist. So we found our filename.
				var finalFilename = tmpFilename + ((i != 0) ? counter : "") + fileExt;

				//And done. 
				callback(null, path.join(albumPath, finalFilename));
			} else {
				//somthing else
				callback(err);
			}
		};

		fs.stat(path.join(albumPath, tmpFilename + fileExt), findFilename);
	}

	_deleteEmtyDir (albumPath, callback) {
		fs.readdir(albumPath, function (err, files) {
			if (err) {
				callback(err);
			} else if (files.length == 0) {
				fs.rmdir(albumPath, function (err) {
					if (err) {
						callback(err);
					} else {
						var artistPath = path.join(albumPath, "..");
						fs.readdir(artistPath, function (err, files) {
							if (err) {
								callback(err);
							} else if (files.length == 0) {
								fs.rmdir(artistPath, function (err) {
									callback(err);
								});
							} else {
								callback(null);
							}
						});
					}
				});
			} else {
				callback(null);
			}
		});
	}

	/**
     * Checks if username and password match
     * @param {string} username - Username
     * @param {string} password - password
     * @param {Music~loginCheckCallback} cb - Callback
     */
	loginCheck (username, password, callback) {
		this._db.getUser(username, function (err, user) {
			if (err) {
				//TODO: log error
				callback(err,false,null);
			}else if(!user){
				//User not found
				callback(null,false,null);
			} else {
				bcrypt.compare(password, user.password, function (err, same) {
					if (err) {
						callback(err);
					} else if (!same) {
						callback(null, false,null);
					} else {
						callback(null, true, user);
					}
				});
			}

		});
	}

	/**
     * Gets a user
     * @param {string} username - username
     * @param {Music~getUserCallback} cb - Callback
     */
	getUser (username, callback) {
		this._db.getUser(username, callback);
	}

	/**
     * Adds a new user to the system
     * @param {string} username - username
     * @param {string} password - password
     * @param {errCallback} cb - Callback
     */
	addUser (username, password, callback) {
		//TODO: check if username is valid (no spaces, not to short ...)
		this._db.getUser(username, function (err, result) {
			if (err) {
				//TODO: log error
				callback(err);
			} else if (result) {
				callback(new Error("User already exist"));
			} else {
				bcrypt.hash(password, 5, function (err, hash) {
					if (err) {
						//TODO: log eroor
						callback(err);
					} else {
						this._db.addUser(username, hash, function (err) {
							if (err) {
								//TODO: log error
								callback(err);
							} else {
								callback(null);
							}
						});
					}
				});
			}
		});
	}

	/**
     * Get all Users from the system 
     * @param {*} cb - Callback 
     */
	getAllUsers (cb) {
		this._db.getAllUsers(cb);
	}

	/**
     * Changes the password of a user
     * @param {string} username 
     * @param {string} newPassword 
     * @param {errCallback} callback 
     */
	updatePassword (username, newPassword, callback) {
		this._db.updatePassword(username,newPassword,function(err){
			if(err){
				//TODO: log error
			}
			callback(err);
		});
	}

	/**
     * Removes a user from the system
     * @param {string} username 
     * @param {errCallback} cb 
     */
	deleteUser(username, callback) {
		this._db.removeUser(username,function(err){
			if(err){
				//TODO: log error
			}
			callback(err);
		});
	}
}

module.exports = Music;
