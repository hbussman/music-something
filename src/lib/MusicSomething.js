"use strict";
const Music = require("./Music");

class MusicSomething{
	constructor(config,dbmodule,modules,logger){
		this._db = new dbmodule(config);
		this._config = config;

		this._modules = [];
		if(modules){
			this._modulesConstructor = modules;
		}else{
			this._modulesConstructor = [];
		}

		if(logger){
			this._logger = logger;
		}else{
			var stubLogger = function(){

			};
			this._logger = {
				error:stubLogger,
				warn:stubLogger,
				info:stubLogger,
				verbose:stubLogger,
				debug:stubLogger,
				silly:stubLogger
			};
		}

	}

	start(callback){
		this._db.connect(function(err){
			if(err){
				this._logger.error("Failed to start musicSomething: " + err.message);
				typeof callback === "function" && callback(err);
			}else{
				this._music = new Music(this._db,this._config,this._logger);

				for(let m of this._modulesConstructor){
					this._modules.push(new m(this._music,this._logger,this._config));
				}
				
				let i = 0;
				for(let m of this._modules){
					if(typeof m.init === "function"){
						m.init(this._modules,function(){
							if(++i >= this._modules.length){
								typeof callback === "function" && callback(null);
							}
						}.bind(this));
					}
				}
			}
		}.bind(this));
	}
}

module.exports = MusicSomething;
