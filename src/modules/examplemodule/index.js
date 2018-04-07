/* eslint-disable */
"use strict";

class examplemodule {
	/**
	 *
	 * @param {Music} music
	 * @param {*} logger
	 * @param {*} config
	 */
	constructor(music, logger, config) {

	}

	/**
	 * If you want to have an webapi access then return the (express)router here.
	 */
	get router() {
		//return null;
	}

	/**
	 * Called when all modules are created if you need to access other modules like the webserver module does or start a service
	 * @param {*} allModules - all modules including self as an array
	 */
	init(allModules, callback) {

	}

}

module.exports = examplemodule;