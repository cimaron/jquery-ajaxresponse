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
 * jQuery.ajax manual responses
 */
(function($) {
	"use strict";

	var _default = $.ajaxSettings.xhr,
	    queue = [],
		events = $({}),
		hasHandlers = false,
		listener
		;

	/**
	 * Mock xhr function to return our stub interface to jQuery
	 */
	function xhr() {
		var next, response;

		next = queue.shift();
		if (next === undefined && !hasHandlers) {
			throw new Error("No response registered for request");	
		}

		response = new XMLHttpResponse();

		response.on('open', function() {
			if (next && next.open) {
				next.open.apply(this, arguments);
			} else {
				events.trigger('open', arguments);
			}
		});

		response.on('send', function() {
			if (next && next.send) {
				next.send.apply(this, arguments);
			} else {
				events.trigger('send', arguments);
			}
		});

		return response.xhr;
	}
	
	/**
	 * Ajax stub
	 */
	listener = {

		/**
		 * Queues up a response callback for the next Ajax call only
		 */
		enqueue : function(open, send) {
			queue.push({ open : open, send : send });
		},

		/**
		 * Start listening for jQuery.ajax calls
		 */
		start : function() {
			$.ajaxSettings.xhr = xhr;
		},

		open : function(func) {
			events.on('open', function(e, response, args) {
				func.apply(response, [response, args]);
			});
			hasHandlers = true;			
		},

		send : function(func) {
			events.on('send', function(e, response, args) {
				func.apply(response, [response, args]);
			});
			hasHandlers = true;			
		},

		/**
		 * Stop listening for jQuery.ajax calls
		 */
		stop : function() {
			$.ajaxSettings.xhr = _default;	
		}

	};

	$.ajaxResponse = function(command, extra, extra2) {
		var i, item, queue;

		switch (command) {
			
			//Start listening to ajax calls
			case 'start':
				listener.start();
				return;
			
			//Stop listening to ajax calls
			case 'stop':
				listener.stop();
				return;
			
			//Register the open handler
			case 'onOpen':
				if (typeof extra === 'function') {
					listener.open(extra);
				}
				return;
			
			//Register the send handler
			case 'onSend':
				if (typeof extra === 'function') {
					listener.send(extra);
				}
				return;

			//Accept either single or double function params
			case 'enqueue':
				if (typeof extra2 == 'function') {
					listener.enqueue(extra, extra2);
				} else {
					listener.enqueue(null, extra);
				}
				return;

			default:
				if (typeof command == 'function' && typeof extra == 'function') {
					listener.open(extra);
					listener.send(extra1);
				} else if (typeof command == 'function') {
					listener.send(extra);
				}
		}

	};

}(jQuery));

