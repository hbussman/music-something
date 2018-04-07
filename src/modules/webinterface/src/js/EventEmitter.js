/* eslint-env browser, jquery */
"use strict";

class EventEmitter {
	constructor() {
		this._events = [];
	}

	on(name, callback) {
		return this.addEventListerner(name, callback);
	}

	addEventListerner(name, callback) {
		return this._events.push({
			name,
			callback
		}) - 1;
	}

	removeEventListerner(id) {
		this._events[id] = undefined;
	}

	_emit(eventName, ...args) {
		for (let l of this._events) {
			if (typeof l !== "undefined" && l.name == eventName) {
				typeof l.callback === "function" && l.callback(...args);
			}
		}
	}

	_pass(name) {
		return function (...args) {
			this._emit(name, args);
		}.bind(this);
	}
}

export default EventEmitter;
