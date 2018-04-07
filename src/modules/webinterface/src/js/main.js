/* eslint-env browser, jquery */
/* eslint-disable no-alert, no-console */
/* global Vue */
"use strict";

import Player from "./Player";
import Context from "./Context";

(function () {
	let player = new Player();
	let songContext;
	window.onload = function () {

		let vu = new Vue({
			el: "#songTable",
			data: function () {
				return {
					songs: player.songs,
					sortKey: 0, //0: title 1: Artist 2:Album : 3:duration (you could use strings but ... nah)
					sortAsc: true
				};
			},
			methods: {
				updateSongs: function () {
					player.updateSongList(function(){
						this.songs = player.songs;
					}.bind(this));
					
				},
				getSortKeyValue: function (song) {
					switch (this.sortKey) {
						case 0:
							return song.metadata.title;
						case 1:
							return song.metadata.artist;
						case 2:
							return song.metadata.album;
						case 3:
							return song.duration;
						default:
							return song.metadata.title;
					}
				},
				changeSortKey: function (newKey) {
					this.sortKey = newKey;
					this.sortAsc = !this.sortAsc;
				},
				doubleClick:function(index){
					player.playSongById(this.filteredSongs[index].id);
				},
				playNext: function(){
					let currentIndex = this.filteredSongs.findIndex(function(element){
						return element.id == player.currentSong;
					});

					if(currentIndex < this.songs.length -1){
						player.playSongById(this.filteredSongs[currentIndex+1].id);
					}

				},
				playPrevious: function(){
					let currentIndex = this.filteredSongs.findIndex(function(element){
						return element.id == player.currentSong;
					});

					if(currentIndex >0){
						player.playSongById(this.filteredSongs[currentIndex-1].id);
					}
				},
				contextMenu: function(index,event){
					songContext.displayAt(event,this.filteredSongs[index]);
				},
				presedPlay: function(){
					console.log("presed Playe");
					if(player.readyToPlay()){
						player.togglePause();
						console.log(player.readyToPlay());
					}else{
						if(this.songs.length >= 1){
							player.playSongById(this.filteredSongs[0].id);
						}
					}
				}

			},
			computed: {
				filteredSongs: function () {
					return this.songs.sort(function (a, b) {
						if (this.getSortKeyValue(a) < this.getSortKeyValue(b)) return (this.sortAsc) ? -1 : 1;
						if (this.getSortKeyValue(a) > this.getSortKeyValue(b)) return (this.sortAsc) ? 1 : -1;
						if (this.getSortKeyValue(a) == null) return (this.sortAsc) ? 1 : -1;
						if (this.getSortKeyValue(b) == null) return (this.sortAsc) ? -1 : 1;
						return 0;
					}.bind(this));
				}
			}
		});

		//Create contextmenu for the songs 
		songContext = new Context([
			{
				title:"Play",
				callback:function(selectedSong){
					player.playSongById(selectedSong.id);
				}
			},
			{
				title:"Edit",
				callback:function(selectedSong){
					$("#editModalID").val(selectedSong.id);
					$("#editModalTitle").val(selectedSong.metadata.title);
					$("#editModalArtist").val(selectedSong.metadata.artist);
					$("#editModalAlbum").val(selectedSong.metadata.album);
					$("#editModalGenre").val(selectedSong.metadata.genre);
					$("#editModalYear").val(selectedSong.metadata.year);
					$("#editModalFile").val(selectedSong.file);
					$("#editModal").modal("show");
				}
			},
			{
				title:"Delete",
				callback: function(selectedSong){
					$("#deleteModalSongname").text(selectedSong.title);
					$("#deleteModal").modal("show");
				}
			}
		]);


		// event listners

		player.on("ended",function(){
			vu.playNext();
		});


		player.on("error",function(error){
			//TODO: inform user that something fucked up
		});

		player.on("timeupdate",function(){
			$("#progressSongBar").width((player.currentTime  / player.duration )* 100 + "%");
		});

		player.on("pauseChaned",function(){
			if (player.isPaused) {
				$("#start-stop").attr("class", "glyphicon glyphicon-play pointer");
			} else {
				$("#start-stop").attr("class", "glyphicon glyphicon-pause pointer");
			}
		});

		//Update songlist for the first time
		vu.updateSongs();
		
		//Bind Buttons with player functions

		$("#backBtn").on("click", function () {
			vu.playPrevious();
		});

		$("#start-stop").on("click", function () {
			vu.presedPlay();
		});

		$("#nextBtn").on("click", function () {
			vu.playNext();
		});

		//Progressbar

		$("#progressSong").on("click", function (event) {
			var pc = event.offsetX / document.getElementById("progressSong").offsetWidth;
			if (player.skipTimeTo(player.duration * pc)) {
				$("#progressSongBar").width(pc * 100 + "%");
			}
		}); 

		//Volume 

		let volumeSlider = this.document.getElementById("volumeSlider");

		var oninputEvent = function () {
			player.volume = (volumeSlider.value / 100);

			if (volumeSlider.value >= 90) {
				$("#volumeSpan").attr("class", "glyphicon glyphicon-volume-up pointer");
			} else if (volumeSlider.value > 0) {
				$("#volumeSpan").attr("class", "glyphicon glyphicon-volume-down pointer");
			} else {
				$("#volumeSpan").attr("class", "glyphicon glyphicon-volume-off pointer");
			}

		};

		volumeSlider.oninput = oninputEvent;
		oninputEvent();

		$("#volume").on("click",function () {
			if ($("#volumeSliderContainer").css("visibility") == "hidden") {
				$("#volumeSliderContainer").css("visibility", "visible");
			} else {
				$("#volumeSliderContainer").css("visibility", "hidden");
			}
		});

		//Hotkeys

		let hotkeyEnabled = true;

		$(document).on("keydown", function (event) {
			if (event.keyCode == 32 && hotkeyEnabled) {
				vu.presedPlay();
				event.preventDefault();
			}
		});

		$(".modal").on("shown.bs.modal", function () {
			hotkeyEnabled = false;
		});

		$(".modal").on("hidden.bs.modal", function () {
			hotkeyEnabled = true;
		});

		//All the modal bindings and stuff

		
		$("#deleteModalBtn").on("click", function () {
			var deleteId= songContext.args[0].id;
			player.deleteSong(deleteId,function(){
				vu.updateSongs();

				//Stop playing when deleted song is playing
				if(player.currentSong == deleteId){
					player.stop();
				}
			});
		});

		$("#editModalBtn").on("click", function () {
			player.edit($("#editModalID").val(), {
				title: $("#editModalTitle").val(),
				artist: $("#editModalArtist").val(),
				album: $("#editModalAlbum").val()
			},function(){
				vu.updateSongs();
			});

		});

		$("#addModalYTdlBtn").on("click", function () {
			var url = $("#ytdlURL").val();
			var id = new URL(url).searchParams.get("v");
			player.downloadYT(id);
		});

		$("#addModalUploadBtn").on("click", function () {
			player.uploadSong(document.getElementById("uploadModalForm"), function () {
				$("#uploadModal").modal("hide");

				$("#uploadModalAlbum").val("");
				$("#uploadModalArtist").val("");
				$("#uploadModalTitle").val("");
				$("#uploadModalFile").val(null);
				$("#uploadModalProgress").width("0%");

				vu.updateSongs();
			}, function () {
				var xhr = $.ajaxSettings.xhr();

				xhr.upload.onprogress = function (ev) {
					if (ev.lengthComputable) {
						var percentComplete = parseInt((ev.loaded / ev.total) * 100);
						$("#uploadModalProgress").width(percentComplete + "%");
					}
				};

				return xhr;
			});
		});


		//Eventlistner for the browser extention
		window.addEventListener("message", function (event) {

			switch (event.data.action) {
				case "pausePlay":
					vu.presedPlay();
					break;
	
				case "next":
					player.playNext();
					break;
	
				case "previous":
					player.playPrevious();
					break;
			}
		});

	};

	

})();
