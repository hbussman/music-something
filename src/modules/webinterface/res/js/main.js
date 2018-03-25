(function () {
	var player;
	window.onload = function () {
		var currentSong;
		var hotkeyEnabled = true;
		var hasLocalStorage;
		var volumeSlider;
		var lastSelected;
		//Define Global Doms
		volumeSlider = $("#volumeSlider")[0];

		player = new MusicSomethingPlayer();

		player.onSongChange = function () {
			updateBtn();
		};

		player.onPausedChanged = function () {
			updateBtn();
		};

		player.onEnded = function () {
		};

		player.onError = function () {

		};

		player.onContext = function (event, selected) {
			lastSelected = selected;
			switch (event) {

				case "edit":
					$("#editModalTitle").val(selected.metadata.title);
					$("#editModalArtist").val(selected.metadata.artist);
					$("#editModalAlbum").val(selected.metadata.album);
					$("#editModal").modal("show");
					break;

				case "delete":

					$("#deleteModalSongname").html(selected.title);
					$("#deleteModal").modal("show");
					break;
			}
		};


		$("#backBtn").on("click", function (event) {
			player.playPrevious();
		});

		$("#start-stop").on("click", function (event) {
			player.togglePause();
		});

		$("#nextBtn").on("click", function (event) {
			player.playNext();
		});

		$("#progressSong").on("click", function (event) {

			var pc = event.offsetX / document.getElementById("progressSong").offsetWidth;
			if (player.skipTimeTo(player.getDuration() * pc)) {
				$("#progressSongBar").width(pc * 100 + "%");
			}

		});



		$("#deleteModalBtn").on("click", function (event) {
			player.deleteSong(lastSelected.id);
		});

		$("#editModalBtn").on("click", function (event) {
			player.edit(lastSelected.id, {
				title: $("#editModalTitle").val(),
				artist: $("#editModalArtist").val(),
				album: $("#editModalAlbum").val()
			});


		});

		$("#addModalYTdlBtn").on("click", function (event) {
			var url = $("#ytdlURL").val();
			var id = new URL(url).searchParams.get("v");
			player.downloadYT(id);
		});

		$("#addModalUploadBtn").on("click", function (event) {
			player.uploadSong(document.getElementById("uploadModalForm"), function (data, status, xhr) {
				$("#uploadModal").modal("hide");

				$("#uploadModalAlbum").val("");
				$("#uploadModalArtist").val("");
				$("#uploadModalTitle").val("");
				$("#uploadModalFile").val(null);
				$("#uploadModalProgress").width("0%");
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

		//Hotkeys

		$(document).on("keydown", function (event) {
			if (event.keyCode == 32 && hotkeyEnabled) {
				player.togglePause();
				event.preventDefault();
			}
		});

		$(".modal").on("shown.bs.modal", function () {
			hotkeyEnabled = false;
		});

		$(".modal").on("hidden.bs.modal", function () {
			hotkeyEnabled = true;
		});

		//Timebar

		player.ontimeupdate = function () {
			$("#progressSongBar").width((player.getCurrentTime() / player.getDuration()) * 100 + "%");
		};

		//volume slider
		var oninputEvent = function () {
			player.setVolume(volumeSlider.value / 100);

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

		document.getElementById("volume").onclick = function () {
			if ($("#volumeSliderContainer").css("visibility") == "hidden") {
				$("#volumeSliderContainer").css("visibility", "visible");
			} else {
				$("#volumeSliderContainer").css("visibility", "hidden");
			}
		};

		//Local storage for storing the set volume even when page reloads
		if (typeof (Storage) != "undefined") {
			hasLocalStorage = true;
			volumeSlider.value = localStorage.getItem("volume");
			oninputEvent();
		} else {
			hasLocalStorage = false;
		}

		//Stop user from closing the page when music is plaing 
		//FIXME: some elements like the title gets unloaded anyways
		/*
        window.onbeforeunload = function (e) {
            var confirmationMessage = 'You are still listening to music. Do you want to leave?';
            localStorage.setItem("volume", volumeSlider.value);
            return ((!player.paused) ? confirmationMessage : undefined)
        };
        */

		function updateBtn() {
			if (player.isPaused()) {
				$("#start-stop").attr("class", "glyphicon glyphicon-play pointer");
			} else {
				$("#start-stop").attr("class", "glyphicon glyphicon-pause pointer");
			}
		}



	};

	window.addEventListener("message", function (even) {

		switch (event.data.action) {
			case "pausePlay":
				player.togglePause();
				break;

			case "next":
				player.playNext();
				break;

			case "previous":
				player.playPrevious();
				break;
		}
	});

})();
