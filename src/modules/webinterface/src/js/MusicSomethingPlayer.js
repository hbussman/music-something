
function MusicSomethingPlayery() {
	//Private
	var audio;
	var tableVue;
	var currentSong;
	var tableId = "mainTable";
	var parentId = "mainPage";
	var selected;
	var context = $("#contextmenu");
	//Events
	this.onSongChange;
	this.onPausedChanged;
	this.onEnded;
	this.onError;
	this.onContext;
	//Private Methods
	var createSongTable = function () {

		var table = document.createElement("table");
		table.id = tableId;
		table.className = "table table-hover noselect";
		var tableHead = document.createElement("thead");

		var headRow = document.createElement("tr");

		var heads = ["Title", "Artist", "Album", "Duration"];

		heads.forEach(element => {
			var cell;
			cell = document.createElement("th");
			cell.innerText = element;
			cell.className = "pointer";
			cell.setAttribute("v-on:click", "changeSortKey('" + element.toLocaleLowerCase() + "')");
			headRow.appendChild(cell);
		});

		tableHead.appendChild(headRow);
		table.appendChild(tableHead);

		var tableBody = document.createElement("tbody");
		var bodyRow = document.createElement("tr");

		bodyRow.setAttribute("v-for", "(song,index) in filteredSongs");
		bodyRow.setAttribute("v-on:dblclick", "dblclick(index)");
		bodyRow.setAttribute("v-on:contextmenu", "oncontextmenu(index,$event)");
		bodyRow.setAttribute("v-cloak", "");

		bodyRow.innerHTML = "<td>{{song.metadata.title}}</td> <td>{{song.metadata.artist}}</td> <td>{{song.metadata.album}}</td> <td>{{song.durationMin}}</td>";

		tableBody.appendChild(bodyRow);
		table.appendChild(tableBody);

		document.getElementById(parentId).appendChild(table);

	};

	var createContextMenu = function () {

	};

	var openContextmenu = function (index, event) {

		selected = vue.songList[index];

		//set pos of the div
		if (event.clientX + 200 > $(window).width()) {
			context.css({ top: event.pageY + "px", left: event.pageX - 200 + "px", visibility: "visible" });
		} else {
			context.css({ top: event.pageY + "px", left: event.pageX + "px", visibility: "visible" });
		}

		document.onclick = function (event2) {
			context.css({ visibility: "hidden" });
			document.onclick = null;
			selected = null;
		};
		event.preventDefault();
	};

	var secToMin = function (sec) {
		var min = Math.floor(sec / 60);
		var restSec = sec % 60;
		var time = min + ":";

		if (restSec < 10) {
			time += "0" + restSec;
		} else {
			time += restSec;
		}

		return time;
	};

	var playSong = function (song) {
		audio.pause();
		audio.src = "api/songs/" + song.id + "/file";
		audio.play();

		currentSong = song;

		typeof this.onSongChange == "function" && this.onSongChange(currentSong);
	}.bind(this);

	//Methods
	this.play = function () {
		if (!audio.src) {
			if (currentSong) {
				playSong(currentSong);
				typeof this.onPausedChanged == "function" && this.onPausedChanged();
			} else if (vue.songList.length >= 1) {
				playSong(vue.songList[0]);
				typeof this.onPausedChanged == "function" && this.onPausedChanged();
			}

		} else {
			audio.play();
			typeof this.onPausedChanged == "function" && this.onPausedChanged();
		}


	};

	this.pause = function () {
		audio.pause();
	};

	this.togglePause = function () {
		if (audio.paused) {
			this.play();
		} else {
			this.pause();
		}
		typeof this.onPausedChanged == "function" && this.onPausedChanged();
	};

	this.isPaused = function () {
		return audio.paused;
	};

	this.playNext = function () {
		var index = vue.songList.findIndex(function (element) {
			return element === currentSong;
		});

		if (vue.songList.length > index + 1) {
			playSong(vue.songList[index + 1]);
		} else {
			typeof this.onEnded == "function" && this.onEnded();
		}

	};

	this.playPrevious = function () {
		var index = vue.songList.findIndex(function (element) {
			return element === currentSong;
		});

		if (index - 1 >= 0) {
			playSong(vue.songList[index - 1]);
		}
	};

	this.playSong = function (id) {
		var song = vue.songList.find(function (element) {
			return element.id == id;
		});
		playSong(song);
	};

	this.deleteSong = function (id) {
		$.ajax({
			method: "DELETE",
			url: "api/songs/" + id,
			success: function (data) {
				vue.updateTracklist();

				if (currentSong && id == currentSong.id) {
					audio.src = "";
					this.pause();
				}
			}.bind(this)
		});
	};

	this.downloadYT = function (id) {

		$.get({
			url: "api/downloadYoutube",
			data: {
				id: id
			},
			success: function (res) {

			}
		});

	};

	this.updateSongList = function () {
		vue.updateTracklist();
	};

	this.setVolume = function (volume) {
		audio.volume = volume;
	};

	this.getVolume = function () {
		return audio.volume;
	};

	this.getDuration = function () {
		if (audio.src) {
			return audio.duration;
		} else {
			return null;
		}
	};

	this.getCurrentTime = function () {
		return audio.currentTime;
	};

	this.skipTimeTo = function (time) {
		if (audio.src) {
			audio.currentTime = time;
			return true;
		} else {
			return false;
		}
	};

	this.edit = function (id, att) {
		$.ajax({
			url: "api/songs/" + id,
			method: "PATCH",
			data: att,
			success: function (data) {
				//debugger;
				vue.updateTracklist();
			},

			error: function (xhr, status, error) {
				//err
			}

		});
	};

	this.uploadSong = function (fileFrom, success, xhr) {

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
					vue.updateTracklist();
					typeof success == "function" && success(data, status, xhr);
				},
				error: function (xhr, status, error) {
					//err
					console.log(error);
				}
			});
		}
	};


	// "consturctor"

	$("#contextmenuPlay").on("click", function (event) {
		playSong(selected);
	}.bind(this));

	$("#contextmenuEdit").on("click", function (event) {
		typeof this.onContext == "function" && this.onContext("edit", selected);
	}.bind(this));

	$("#contextmenuPlaylist").on("click", function (event) {
		//TODO
	});

	$("#contextmenuDelete").on("click", function (event) {
		typeof this.onContext == "function" && this.onContext("delete", selected);
	}.bind(this));

	$("#contextmenuDownload").on("click", function (event) {
		var a = document.createElement("a");
		a.download = selected.metadata.title;
		a.href = "api/songs/" + selected.id + "/file";
		a.style.display = "none";
		document.body.appendChild(a);
		a.click();
		if (a.parentNode) {
			a.parentNode.removeChild(a);
		}
	});

	audio = new Audio();

	audio.onended = function () {

		var index = vue.songList.findIndex(function (element) {
			return element === currentSong;
		});

		if (vue.songList.length == index - 1) {
			typeof this.onEnded == "function" && this.onEnded();
		} else {
			this.playNext();
		}

	}.bind(this);

	audio.ontimeupdate = function () {
		typeof this.ontimeupdate == "function" && this.ontimeupdate(audio.currentTime, audio.duration);
	}.bind(this);

	createSongTable();

	vue = new Vue({
		el: "#" + tableId,
		data: {
			songList: [],
			sortKey: "title",
			sortAsc: true

		},
		methods: {

			changeSortKey: function (key) {
				debugger;
				this.sortKey = key;
				this.sortAsc = !this.sortAsc;
			},

			oncontextmenu: function (index, event) {
				openContextmenu(index, event);
			},

			dblclick: function (index) {
				playSong(this.songList[index]);
			},

			updateTracklist: function () {
				$.ajax({
					method: "GET",
					url: "api/songs",
					success: function (data) {
						data.forEach(function (element, index) {
							data[index].durationMin = secToMin(element.duration);
						});

						this.songList = data;
					}.bind(this),

					error: function (jqXHR, textStatus, errorThrown) {
						//Error
					}.bind(this)
				});
			},


		},

		computed: {
			filteredSongs: function () {
				return this.songList.sort(function (a, b) {
					
					if (a[this.sortKey] < b[this.sortKey]) return (this.sortAsc) ? -1 : 1;
					if (a[this.sortKey] > b[this.sortKey]) return (this.sortAsc) ? 1 : -1;
					if (a[this.sortKey] == null) return (this.sortAsc) ? 1 : -1;
					if (b[this.sortKey] == null) return (this.sortAsc) ? -1 : 1;
					return 0;
				}.bind(this));
			}
		}
	});

	currentSong = (vue.songList.length >= 1) ? vue.songList[0] : null;
	this.updateSongList();
}
