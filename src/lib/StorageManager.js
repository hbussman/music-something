"use strict";

const mkdirp = require("mkdirp");
const path = require("path");


class StorageManager {

	constructor(config) {

		// this acts as a template; the values will be replaced by the actual full paths in init()
		this.storageDirs = {
			DATA: "data",
			LOGS: "log"
		};

		this._config = config;
	}

	static getConfigTemplate() {
		return {
			section: "storage",
			description: "Configure storage settings",
			elements: [
				{
					option: "homeDir",
					description: "Define where music-something should store its local files",
					standard: "~/.music-something/"
				}
			]
		};
	}

	init() {
		// make sure all folders that we need for storage do actually exist and save their paths
		for (let key in this.storageDirs) {
			let dir = path.join(this._getHomePath(), this.storageDirs[key]);
			console.log("creating " + dir); //TODO XXX
			mkdirp.sync(dir, function (err) {
				if (err) throw err;
			});
			this.storageDirs[key] = dir;
		}
	}

	_getHomePath() {
		return this._config.storage.homeDir.replace("~", process.env.APPDATA || process.env.HOME);
	}
}

module.exports = StorageManager;
