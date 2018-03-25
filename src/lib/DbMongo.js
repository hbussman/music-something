/*eslint-disable no-underscore-dangle*/
"use strict";
const DbBase = require("./DbBase");
const mongodb = require("mongodb");
const Song = require("./Song");

class DbMongo extends DbBase {
	constructor(config) {
		super();
		this._config = config;
	}

	/**
	 * Connect to the database.
	 * @param {errCallback} callback - Callback
	 */
	connect(callback) {

		if(!this._config.database.url){
			process.nextTick(function(){typeof callback === "function" && callback(new Error("Db URL not in config defined"));});
			return; 
		}

		mongodb.MongoClient.connect(this._config.database.url, function (err, mongoDb) {
			if (err) {
				callback(err);
			} else {
				this._connection = mongoDb;
				typeof callback === "function" && callback(null);
			}
		}.bind(this));
	}


	/**
	 * Setup the database. Called when the server starts for the first time.
	 * @param {errCallback} callback 
	 */
	setup(defaultUser,callback) {
		this._connection.createCollection("songs",function(err){
			if(err){
				typeof callback === "function" && callback(err);
			}else{
				this._connection.createCollection("users",function(err){
					if(err){
						typeof callback === "function" && callback(err);
					}else{
						this._connection.collection("users").insert({
							username:defaultUser.username,
							password:defaultUser.password
						},function(err){
							typeof callback === "function" &&  callback(err);
						});
					}
				}.bind(this));
			}
			
		}.bind(this));
		
	}

	/**
	 * Get all songs from the database
	 * @param {*} filter 
	 * @param {DbBase~getSongsCallback} callback 
	 */
	getSongs(filter, callback) {
		this._connection.collection("songs").find(filter).toArray(function (err, result) {
			if (err) {
				this._logger.error("Could not get songs: " + err);
				typeof callback === "function" && callback(err, null);
			} else {
				let retunResult = [];
				result.forEach(element => {
					retunResult.push(new Song({
						metadata: element.metadata,
						id: element._id.toString(),
						duration: element.duration,
						file: element.file,
						created: mongodb.ObjectID(element._id).getTimestamp()
					}));
				});
				typeof callback === "function" && callback(null,retunResult);
			}
		});
	}


	/**
	 * Get a spesific song
	 * @param {string} id - Id of the song
	 * @param {DbBase~getSongCallback} callback 
	 */
	getSong(id, callback) {
		let _id;
		try{
			_id = new mongodb.ObjectID(id);
		}catch(e){
			process.nextTick(function(){typeof callback === "function" && callback(e,null);});
		}
		
		this._connection.collection("songs").findOne({ _id }, function (err, result) {
			if (err || !result) {
				typeof callback === "function" && callback(err, null);
			} else {
				result.created = mongodb.ObjectID(result._id).getTimestamp();
				result.id = result._id.toString();
				typeof callback === "function" && callback(null,new Song(result));
			}
		});
	}

	/**
	 * Get all artists 
	 * @param {DbBase~getArtistsCallback} callback - 
	 */
	getArtists(callback) {
		this._connection.collection("songs").aggregate([{
			$group: {
				_id: "$metadata.artist",
				numSongs: {
					$sum: 1
				}
			}
		}]).toArray(function(err,result){
			let newResult =[];
			result.forEach(function(element){
				if(element._id == null){
					newResult.push({
						name:"Unknown artist",
						numSongs:element.numSongs
					});
				}else{
					newResult.push({
						name:element._id,
						numSongs:element.numSongs
					});
				}

			});

			typeof callback === "function" && callback(err,newResult);
		});
	}

	/**
	 * Get all Albums
	 * @param {DbBase~getAlbumsCallback} callback 
	 */
	getAlbums(callback) {
		this._connection.collection("songs").aggregate([{
			$group: {
				_id: "$metadata.album",
				numSongs: {
					$sum: 1
				}
			}
		}]).toArray(function(err,result){
			let newResult =[];
			result.forEach(function(element){
				if(element._id == null){
					newResult.push({
						name:"Unknown album",
						numSongs:element.numSongs
					});
				}else{
					newResult.push({
						name:element._id,
						numSongs:element.numSongs
					});
				}

			});

			typeof callback === "function" && callback(err,newResult);
		});
	}

	/**
	 * Adds a song to the Database
	 * @param {Song} song - Song to add
	 * @param {errCallback} callback
	 */
	addSong(song, callback) {
		let dbObject = this._SongToDbObject(song);

		this._connection.collection("songs").insert(dbObject, function (err) {
			typeof callback === "function" && callback(err);
		});

	}

	/**
	 * Updates a song 
	 * @param {Song} song 
	 * @param {errCallback} callback 
	 */
	updateSong(song, callback) {
		
		let dbObject = this._createUpdateObject(song);
		this._connection.collection("songs").updateOne({
			_id: new mongodb.ObjectId(song.id)
		},dbObject, function(err){
			typeof callback === "function" && callback(err);
		});
	}

	/**
	 * Removes a Song
	 * @param {string} id - Id of the Song
	 * @param {errCallback} callback 
	 */
	removeSong(id, callback){
		let _id;
		try{
			_id = new mongodb.ObjectID(id);
		}catch(e){
			process.nextTick(function(){typeof callback === "function" && callback(e,null);});
		}

		this._connection.collection("songs").remove({ _id },function(err){
			typeof callback === "function" && callback(err);
		});
	}

	/**
	 * Retuns a User with password 
	 * @param {string} username 
	 * @param {DbBase~getUserCallback} callback 
	 */
	getUser(username, callback) {
		this._connection.collection("users").findOne({
			username: username
		}, function (err, result) {
			if (err) {
				typeof callback === "function" && callback(err,null);
			} else if (result) {
				delete result._id;
				typeof callback === "function" && callback(null, result);
			} else {
				typeof callback === "function" && callback(null, null);
			}
		});
	}

	/**
	 * Adds User
	 * @param {string} username 
	 * @param {string} hash
	 * @param {errCallback} callback 
	 */
	addUser(username, hash, callback) {
		
		this._connection.collection("users").insert({
			username: username,
			password: hash
		}, function(err){
			typeof callback === "function" && callback(err);
		});
	}

	/**
	 * Gat all users
	 * @param {DbBase~getAllUsersCallback} callback 
	 */
	getAllUsers(callback) {
		this._connection.collection("users").find({}).toArray(function(err,result){
			if(err){
				typeof callback === "function" && callback(err,null);
			}else{
				result.forEach(element => {
					delete element._id;
				});

				typeof callback === "function" && callback(null,result);
			}
			

		});
	}

	/**
	 * Updates the password from a user
	 * @param {string} username 
	 * @param {string} newHash 
	 * @param {errCallback} callback 
	 */
	updatePassword(username, newHash, callback) {
		this._connection.collection("users").update({ username: username }, {
			$set:{
				password: newHash
			}
		}, function(err){
			typeof callback === "function" && callback(err);
		});
	}

	/**
	 * Removes a user
	 * @param {string} username 
	 * @param {errCallback} callback 
	 */
	removeUser(username,callback){
		this._connection.collection("users").remove({username},function(err){
			typeof callback === "function" && callback(err);
		});
	}

	/**
	 * Converts a Song to a object to strore in the database
	 * @param {Song} song 
	 * @returns {Object} The database object
	 */
	_SongToDbObject(song) {
		return {
			//_id: song.id,
			//id:song.id,
			duration: song.duration,
			file: song.file,
			metadata: {
				title: song.metadata.title,
				artist: song.metadata.artist,
				album: song.metadata.album,
				year: song.metadata.year,
				genre: song.metadata.genreId
			}
		};


	}

	_createUpdateObject(song){
		let updateOject = {};

		["file","duration"].forEach(element => {
			if(song[element]){
				updateOject[element] = song[element];
			}
		});

		["title","artist","album","genre","year"].forEach(element => {
			if(song.metadata[element]){
				updateOject["metadata."+element] = song.metadata[element];
			}
		});
		
		return {$set:updateOject};
	}
}

module.exports = DbMongo;
