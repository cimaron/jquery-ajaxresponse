/*
Copyright (c) 2014 Cimaron Shanahan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * XMLHttpResponse Handler Class
 *
 * Implements interface for responding to XMLHttpRequestStub
 */
function XMLHttpResponse() {
	"use strict";

	this._events = {};

	this.xhr = new XMLHttpRequestStub();

	this.xhr.on('open', function() {
		this.trigger('open', [this, arguments]);
	}.bind(this));

	this.xhr.on('send', function() {
		this.trigger('send', [this, this.xhr._settings]);
	}.bind(this));

}

XMLHttpResponse.prototype = {

	/**
	 * Trigger a timeout
	 *
	 * If timeout value is specified on xhr, the timeout is
	 * triggered after that amount of time. Otherwise, triggers immediately
	 * 
	 */
	timeout : function() {

		if (this.xhr.timeout > 0) {

			setTimeout(function() {
				this.xhr.ontimeout();
			}, this.xhr.timeout);			
		
		} else {
			this.xhr.ontimeout();
		}
	},

	/**
	 * Set the status code
	 *
	 * @param   number   code   Status code
	 * @param   string   text   Status text
	 */
	status : function(code, text) {

		if (this.xhr.readyState !== 1) {
			throw new Error('Request not in a state to accept status (' + this.xhr.readyState + ')');	
		}

		this.xhr.status = code;
		this.xhr.statusText = text;
	},

	/**
	 * Set the response header
	 *
	 * @param   string   k   Key (e.g. 'Content-Type')
	 * @param   string   v   Value (e.g. 'text/html')
	 */
	header : function(k, v) {

		if (this.xhr.readyState !== 1) {
			throw new Error('Request not in a state to accept headers (' + this.xhr.readyState + ')');	
		}

		if (!this.xhr.status) {
			this.status(200, "OK");	
		}

		if (v === null) {
			k = k.split(": ", 2);
			v = k[1];
			k = k[0];
		}

		this.xhr._responseHeaders[k] = v;
	},

	/**
	 * Append text to body of response
	 *
	 * @param   string   text   The text
	 */
	body : function(text) {

		if (this.xhr.readyState == 1) {

			if (!this.xhr.status) {
				this.status(200, "OK");	
			}

			if (this.xhr.getResponseHeader('Content-Type') === null) {
				this.header('Content-Type', 'text/text');
			}

			this.xhr.readyState = 2;
			//this.xhr.onreadystatechange();
		}

		if (this.xhr.responseText === null) {
			this.xhr.responseText = text;	
		} else {
			this.xhr.responseText += text;
		}
		
		if (this.xhr.readyState == 2) {
			this.xhr.readyState = 3;
			//this.xhr.onreadystatechange();
		}
	},

	/**
	 * Finish the response
	 */
	close : function() {

		if (this.xhr.status == 1) {
			this.status(200, "OK");
			this.body("");
		}

		this.xhr.readyState = 4;

		this.xhr.onreadystatechange();
	},

	/**
	 * Shortcut to set a timeout callback
	 *
	 * Useful for quickly simulating a response time
	 *
	 * @param   number     time       Number of ms
	 * @param   function   callback   The handler
	 */
	wait : function(time, callback) {
		var response = this;
		setTimeout(function() {
			callback(response);
		}, time);
	},

	/**
	 * Add event handler
	 *
	 * @param   string     event      Event name
	 * @param   function   callback   Handler
	 *
	 * @return  object
	 */
	on : function(event, callback) {
		var events;

		if (typeof callback == 'function') {
			events = this._events[event] || [];
			events.push(callback);
			this._events[event] = events;
		}

		return this;
	},

	/**
	 * Trigger event handler
	 *
	 * @param   string     event      Event name
	 *
	 * @return  object
	 */
	trigger : function(event, args) {
		var events, i;

		events = this._events[event] || [];

		for (i = 0; i < events.length; i++) {
			events[i].apply(this, args || []);
		}
	}

};
