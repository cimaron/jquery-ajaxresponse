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
 * XMLHttpRequest Stub Class
 *
 * Creates a mock XMLHttpRequest object
 */
function XMLHttpRequestStub() {
	"use strict";

	var i;

	this._requestHeaders = [];
	this._responseHeaders = [];
	this._mime = "";
	this._data = null;

	//Specialized handlers
	this._events = {};
	this._settings = {
		method : "",
		url : "",
		async : true,
		user : "",
		password : "",
		data : ""
	};

	for (i in XMLHttpRequestStub._defaultProps) {
		if (XMLHttpRequestStub._defaultProps.hasOwnProperty(i)) {
			this[i] = XMLHttpRequestStub._defaultProps[i];	
		}
	}
}

XMLHttpRequestStub._defaultProps = {

	onreadystatechange : function() {},
	
	readyState : 0,

	response : null,

	responseText : null,

	responseType : "",

	responseXML : null,
	
	status : 0,
	
	statusText : "",
	
	timeout : 0,
	
	ontimeout : function() {},
	
	upload : function() {},
	
	withCredentials : false

};


XMLHttpRequestStub.prototype = {
	
	/**
	 * Abort the request
	 */
	abort : function() {
	},

	/**
	 * Return all response headers as a string
	 *
	 * @return  string
	 */
	getAllResponseHeaders : function() {
		var i, str = "";

		if (this.readyState < 2) {
			return null;	
		}

		for (i in this._responseHeaders) {
			if (this._responseHeaders.hasOwnProperty(i)) {
				str += i + ": " + this._responseHeaders[i] + "\r\n";
			}
		}

		return str;
	},

	/**
	 * Return response header
	 *
	 * @param   string   header   Header to return
	 *
	 * @return  string|null
	 */
	getResponseHeader : function(header) {

		if (this.readyState < 2) {
			return null;	
		}

		return this._responseHeaders[header];
	},

	/**
	 * Initialize request
	 *
	 * @param   string   method     HTTP method to use (e.g. GET, POST, etc.)
	 * @param   string   url        The URL to send
	 * @param   bool     async      Perform asynchronous request (optional)
	 * @param   string   user       User name for authentication (optional)
	 * @param   string   password   Password for authentication (optional)
	 */
	open : function(method, url, async, user, password) {

		this.readyState = 1;

		this._settings.method = method;
		this._settings.url = url;

		if (async !== undefined) {
			this._settings.async = async;
		}

		if (user !== undefined) {
			this._settings.user = user;
		}

		if (password !== undefined) {
			this._settings.password = password;	
		}

		this.trigger('open', [method, url, async, user, password]);

		this.onreadystatechange();
	},

	/**
	 * Overrides MIME returned by server
	 */
	overrideMimeType : function(mime) {
		
		if (this.readyState < 2) {
			this._mime = mime;
		}
	},

	/**
	 * Send request
	 *
	 * @param   mixed   data   Data
	 */
	send : function(data) {

		this._settings.data = data;

		if (!this._settings.async) {
			this.trigger('send');
		} else {
			setTimeout(function() {
				this.trigger('send');
			}.bind(this), 0);
		}
	},

	setRequestHeader : function(header, value) {
		this._requestHeaders[header] = value;
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

