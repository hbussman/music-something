"use stict";
const Metadata = require("./Metadata");

/**
 * Represents a Song
 */
class Song {
	constructor(initValues) {
		if (initValues) {
			this.metadata = new Metadata(initValues.metadata);
			this.id = initValues.id;
			this.duration = initValues.duration;
			//File should always be relative to the data dir
			this.file = initValues.file;
			this._created = initValues.created;
		}
	}

	//Getters
	get created() {
		return this._created;
	}

	get durationMinutes() {
		let min = Math.floor(this.duration / 60);
		let restSec = this.duration % 60;
		let time = min + ":";

		if (restSec < 10) {
			time += "0" + restSec;
		} else {
			time += restSec;
		}

		return time;
	}

	//Setters
	set created(value) {
		if (value instanceof Date) {
			this._created = value;
		}
	}

	toJSON() {
		let {id, duration, file, durationMinutes} = this;
		return {id, duration, file, durationMinutes, metadata: this.metadata.toJSON()};
	}


}

module.exports = Song;
