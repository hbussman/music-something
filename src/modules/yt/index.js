const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const express = require("express");
const path = require("path");
const router = express.Router();

class YTDownload {

	constructor(music, logger, config) {
		this._music = music;
		this._logger = logger;
		this._config = config;

		this._queue = [];
		this._router = router;
		this._yd = new YoutubeMp3Downloader({
			"ffmpegPath": config.youtube.ffmpegPath,
			"outputPath": path.join(config.dataPath, "tmp"),
			"youtubeVideoQuality": "highest",
			"queueParallelism": 1,
			"progressTimeout": 2000
		});

		this._yd.on("error", function (error) {
			logger.error("YTDownload: " + error);
		});

		this._yd.on("progress", function (progress) {
			//TOD: progress
		});

		this._yd.on("finished", function (err, data) {
			if (err) {
				//err
				throw err;
			} else {
				music.addFile(data.file, {
					//title: data.title
				}, function (err) {
					if (err) {
						//err
						throw err;
					} else {
						logger.info("YTDownload: " + data.videoId + " complete");

						this._queue.shift();

						if (this._queue.length != 0) {
							this._yd.download(this._queue[0].id);
						}
					}

				}.bind(this));
			}

		}.bind(this));

		this._router.get("/api/downloadYoutube", function (req, res) {
			req.app.locals.checkLogin(req, res, function () {
				this.download(req.query.id);
			}.bind(this));

		}.bind(this));
	}

	get router() {
		return this._router;
	}

	static getConfigTemplate() {
		return {
			section: "youtube",
			description: "Configure the Youtube-Downloader plugin",
			elements: [
				{
					option: "ffmpegPath",
					description: "The path to your ffmpeg executable (the default assumes it's in the PATH)",
					standard: "ffmpeg"
				}
			]
		};
	}

	download(id) {
		this._queue.push({
			id: id,
			progress: 0
		});

		if (this._queue.length == 1) {
			this._yd.download(this._queue[0].id);
		}
	}
}

module.exports = YTDownload;