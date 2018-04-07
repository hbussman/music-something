/* eslint no-unused-vars: 0*/
"use strict";

/**
 * Base class with all functions that are needed. Use this as a template for other database drivers.
 */
class DbBase {

	/**
	 * Connect to the database.
	 * @param {errCallback} callback - Callback
	 */
	connect(callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(null);
		});
	}

	/**
	 * Setup the database. Called when the server starts the for first time.
	 * @param {errCallback} callback
	 */
	setup(defaultUser, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(null);
		});
	}

	/**
	 * Get all songs from the database
	 * @param {Object} filter
	 * @param {DbBase~getSongsCallback} callback
	 */
	getSongs(filter, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}


	/**
	 * Get a spesific song
	 * @param {string} id - Id of the song
	 * @param {DbBase~getSongCallback} callback
	 */
	getSong(id, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Get all artists
	 * @param {DbBase~getArtistsCallback} callback -
	 */
	getArtists(callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Get all Albums
	 * @param {DbBase~getAlbumsCallback} callback
	 */
	getAlbums(callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Adds a song to the Database
	 * @param {Song} song - Song to add
	 * @param {errCallback} callback
	 */
	addSong(song, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Updates a song
	 * @param {Song} song
	 * @param {errCallback} callback
	 */
	updateSong(song, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Removes a Song
	 * @param {string} id - Id of the Song
	 * @param {errCallback} callback
	 */
	removeSong(id, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Retuns a User with password
	 * @param {string} username
	 * @param {DbBase~getUserCallback} callback
	 */
	getUser(username, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Adds User
	 * @param {string} username
	 * @param {string} hash
	 * @param {errCallback} callback
	 */
	addUser(username, hash, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Gat all users
	 * @param {DbBase~getAllUsersCallback} callback
	 */
	getAllUsers(callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Updates the password from a user
	 * @param {string} username
	 * @param {string} newHash
	 * @param {errCallback} callback
	 */
	updatePassword(username, newHash, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}

	/**
	 * Removes a user
	 * @param {string} username
	 * @param {errCallback} callback
	 */
	removeUser(username, callback) {
		process.nextTick(function () {
			typeof callback === "function" && callback(new Error("Not implemented"));
		});
	}
}


module.exports = DbBase;

/**
 * @callback DbBase~getSongsCallback
 * @param {*} error - Error
 * @param {Song[]} songs - All Songs
 */

/**
 * @callback DbBase~getSongCallback
 * @param {*} error - Error
 * @param {Song} song - the song (duh)
 */

/**
 * @callback DbBase~getArtistsCallback
 * @param {*} error - Error
 * @param {string[]} result- All artists including "Unknown Artist"
 */

/**
 * @callback DbBase~getAlbumsCallback
 * @param {*} error - Error
 * @param {string[]} result - All Albums including "Unknown Album"
 */

/**
 * @callback DbBase~getUserCallback
 * @param {*} error - Error
 * @param {}
 */

/**
 * @callback DbBase~getAllUsersCallback
 * @param {*} error - Error
 * @param {User[]} result - All Users
 */
