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
 *
 * @version   0.9.0
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

