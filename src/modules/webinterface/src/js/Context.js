/* eslint-env browser, jquery */
"use strict";

/*
	things should look like this:
	[
		{
			title:"Play",
			callback: function(arg1,arg2){
				//Do stuff
			}
		},
		{
			title:"more stuff",
			sub:[
				{
					title:"sub",
					callback:function(arg1,arg2){
						//Do stuff
					}
				}
			]
		}
	]
*/
//Submenus not supportet yet

class ContextMenu{
	constructor(things){
		this._things = things;
		this._args = null;
		this._isHidden = true;
		this._buildDom();

		document.addEventListener("click",function(){
			if(!this._isHidden){
				this.hide();
			}
		}.bind(this));
	}

	get args(){return this._args;}

	_buildDom(){
		let container = document.createElement("div");
		container.id = "contextmenu";
		let ul = document.createElement("ul");
		container.appendChild(ul);

		for(let t of this._things){
			//Create entry
			let entry = document.createElement("li");
			entry.innerText = t.title;

			//Add eventlistener
			entry.addEventListener("click",function(){
				typeof t.callback === "function" && t.callback(... this._args);
				this.hide();
			}.bind(this));

			ul.appendChild(entry);
		}

		this._dom = $(container);
		this.hide();
		document.body.appendChild(container);
		
	}

	displayAt(clickEvent,..._args){
		this._args = _args;
		this._isHidden = false;

		this._dom.css({ visibility: "hidden" });

		//set pos of the div
		if (clickEvent.clientX + 200 > $(window).width()) {
			this._dom.css({ top: clickEvent.pageY + "px", left: clickEvent.pageX - 200 + "px", visibility: "visible" });
		} else {
			this._dom.css({ top: clickEvent.pageY + "px", left: clickEvent.pageX + "px", visibility: "visible" });
		}

		clickEvent.preventDefault();
	}

	hide(){
		this._dom.css({ visibility: "hidden" });
		this._isHidden = true;
	}

}

export default ContextMenu;
