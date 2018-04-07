/* eslint-env browser, jquery */
"use strict";

import EventEmitter from "./EventEmitter";

class MusicSomethingPlayer extends EventEmitter {
	constructor() {
		super();

		this._audio = new Audio();

		this._audio.addEventListener("error", this._pass("error"));
		this._audio.addEventListener("timeupdate", this._pass("timeupdate"));
		this._audio.addEventListener("ended", this._pass("ended"));

	}

	playSongById(id) {
		if (!id) {
			this._emit("error", new Error("id is not defined or empty"));
			return;
		}

		let wasPaused = this.isPaused || !this._audio.src;

		this._audio.pause(); //feels like the right thing to do befor changeing the src
		this._audio.src = "api/songs/" + id + "/file";
		this._audio.play();

		if (wasPaused) {
			this._emit("pauseChaned", true);
		}

		this._emit("songsChanged", id);

	}

	pause() {
		if (!this._audio.isPaused) {
			this._audio.pause();
			this._emit("pauseChaned", false);
		}
	}

	stop() {
		this._audio.pause();
		this._emit("pauseChaned", false);
		this._audio.src = "";

	}

	play() {
		if (this._audio.src) {
			this._audio.play();
			this._emit("pauseChaned", true);
		}
	}

	togglePause() {

		if (this._audio.paused) {
			this._audio.play();
			this._emit("pauseChaned", true);
		} else {
			this._audio.pause();
			this._emit("pauseChaned", false);
		}
	}

	skipTimeTo(time) {
		if (this._audio.src) {
			this._audio.currentTime = time;
			return true;
		} else {
			return false;
		}
	}


	get isPaused() {
		return this._audio.paused;
	}

	set volume(volume) {
		this._audio.volume = volume;
	}

	get volume() {
		return this._audio.volume;
	}

	get duration() {
		return this._audio.duration;
	}

	get currentTime() {
		return this._audio.currentTime;
	}

	edit(id, att, callback) {
		$.ajax({
			url: "api/songs/" + id,
			method: "PATCH",
			data: att,
			success: function () {
				typeof callback === "function" && callback();
			},

			error: this._ajaxErrorHandle

		});
	}

	uploadSong(fileFrom, success, xhr) {

		if (fileFrom.elements["file"].files.length != 0) {
			$.ajax({
				xhr: function () {
					if (typeof xhr == "function") {
						return xhr();
					}
				},
				url: "api/songs/",
				method: "POST",
				data: new FormData(fileFrom),
				contentType: false,
				cache: false,
				processData: false,
				success: function (data, status, xhr) {

					typeof success == "function" && success(data, status, xhr);
				},
				error: this._ajaxErrorHandle
			});
		}
	}

	fetchSongList(callback) {
		$.ajax({
			method: "GET",
			url: "api/songs",
			success: function (data) {
				typeof callback === "function" && callback(data);
			}.bind(this),

			error: this._ajaxErrorHandle
		});
	}

	static secToMin(sec) {
		let min = Math.floor(sec / 60);
		let restSec = sec % 60;
		let time = min + ":";

		if (restSec < 10) {
			time += "0" + restSec;
		} else {
			time += restSec;
		}

		return time;
	}

	deleteSong(id, callback) {
		if (!id) {
			throw new TypeError("id is undefined or null");
		}

		$.ajax({
			method: "DELETE",
			url: "api/songs/" + id,
			success: function () {
				typeof callback === "function" && callback();
			}.bind(this),
			error: this._ajaxErrorHandle
		});
	}

	downloadYT(ytID) {
		$.get({
			url: "api/downloadYoutube",
			data: {
				id: ytID
			},
			error: this._ajaxErrorHandle
		});
	}

	_ajaxErrorHandle(xhr, status, error) {
		this._emit("error", error);
	}

}

export default MusicSomethingPlayer;
