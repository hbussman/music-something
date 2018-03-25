"use strict";

const overidableAttibutes = ["title","artist","album","year","genre"];

/**
 * Represents the Metadata of a Song.
 * The metadata is based from the ID3 metadata
 */

class Metadata {
	constructor(initValues) {
		if (initValues) {

			this.title = initValues.title;
			this.artist = initValues.artist;
			this.album = initValues.album;
			this.year = initValues.year;
			this.genre = initValues.genre;

		}

	}

	//Getters
	get title() { return this._title; }
	get artist() { return this._artist ? this._artist : undefined; }
	get album() { return this._album ? this._album : undefined; }
	get year() { return this._year ? this._year : undefined; }
	get genre() { return this._genre ? this._genre : undefined; }

	//Setters
	set title(value) { this._title = value; }
	set artist(value) { this._artist = value; }
	set album(value) { this._album = value; }
	set year(value) { this._year = value; }
	set genre(value) { this._genre = value; }

	/**
	 * Overides certain attributes from overideMetadata
	 * @param {Metadata} overideMetadata 
	 */
	overideWith(overideMetadata){
		overidableAttibutes.forEach(element => {
			if(overideMetadata[element]){
				this[element] = overideMetadata[element];
			}
		});
	}

	/**
	 * Read the metadata from a result by the music-metadata package
	 * @param {*} fileMetadata 
	 */
	getMetadataFromMusicMetadata(fileMetadata){
		this.title = fileMetadata.common.title;
		this.artist = fileMetadata.common.artist;
		this.album = fileMetadata.common.album;
		this.year = fileMetadata.common.year;
		this.genre = fileMetadata.common.genre;	
	}

	toJSON(){
		let {title,artist,album,year,genre} = this;
		return {title,artist,album,year,genre};
	}
}

module.exports = Metadata;
