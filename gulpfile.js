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

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify')
    ;

// Check errors
gulp.task('lint', function() {
	return gulp.src('./src/*.js')
		.pipe(jshint({
			browser : true			 
		}))
		.pipe(jshint.reporter('default'))
		;
});

// Build
gulp.task('concat', ['lint'], function() {
	return gulp.src('./src/*.js')
		.pipe(concat('jquery.ajaxresponse.js'))
		.pipe(gulp.dest('./build/'))
		;
});

// Minify
gulp.task('uglify', ['concat'], function() {
	return gulp.src('./build/jquery.ajaxresponse.js')
		.pipe(uglify())
		.pipe(rename('jquery.ajaxresponse.min.js'))
		.pipe(gulp.dest('./build/'))
		;
});


gulp.task('default', ['lint', 'concat', 'uglify'], function() {												
});


