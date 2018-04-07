/* eslint-env browser, jquery */
/* eslint-disable no-alert, no-console */
"use strict";

import MusicSomethingPlayer from "./MusicSomething";

class Player extends MusicSomethingPlayer{
	constructor(){
		super();

		this.songs = [];
	}

	get currentSong(){return this._currentSong;}

	updateSongList(callback){
		this.fetchSongList(function(data){
			this.songs = data;
			typeof callback === "function" && callback();
		}.bind(this));
	}

	playSongById(id){

		super.playSongById(id);
		this._currentSong = id;
	
	}

	stop(){
		super.stop();
		this._currentSong = null;
	}

	readyToPlay(){
		return this._currentSong ? true : false;
	}

	
}

export default Player;