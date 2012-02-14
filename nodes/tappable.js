var Rect = require('std/math/Rect'),
	curry = require('std/curry'),
	bind = require('std/bind'),
	client = require('std/client'),
	bind = require('std/bind'),
	on = require('dom/on'),
	off = require('dom/off')

module.exports = {
	withScroll: withScroll,
	withoutScroll: withoutScroll
}

function withScroll(tapHandler) {
	return tappable(allowScroll, tapHandler)
}

function withoutScroll(tapHandler) {
	return tappable(preventScroll, tapHandler)
}

function tappable(handlers, tapHandler) {
	return (client.isMobile
		? {
			touchstart: handlers.onTouchStart,
			touchmove: handlers.onTouchMove,
			touchend: curry(endTouch, tapHandler),
			touchcancel: curry(endTouch, tapHandler)
		} : {
			mousedown: curry(onMouseDown, tapHandler)
		})
}

var preventScroll = {
	onTouchStart: function(e) {
		// TODO Don't listen to move, end or cancel until touch start
		if (e.touches.length > 1) { return }
		e.cancel()
		// if (this.hasClass('disabled')) { return }
		var offset = this.getOffset()
		this.__touchRect = new Rect(offset.left, offset.top, offset.width, offset.height).pad(10)
		this.addClass('active')
	},
	onTouchMove: function(e) {
		if (!this.__touchRect) { return }
		e.cancel()
		var touch = e.touches[0]
		if (this.__touchRect.containsPoint({ x:touch.pageX, y:touch.pageY })) {
			this.addClass('active')
		} else {
			this.removeClass('active')
		}
	}
}

var allowScroll = {
	onTouchStart: function(e) {
		// TODO Don't listen to move, end or cancel until touch start
		if (e.touches.length > 1) { return }
		
		// if (this.hasClass('disabled')) { return }
		var touch = e.touches[0]
		this.__touchRect = new Rect(touch.pageX, touch.pageY, 0, 0).pad(4)
		this.__activeDelayTimeout = setTimeout(bind(this, function() {
			this.addClass('active')
		}), 150)
	},
	onTouchMove: function(e) {
		if (!this.__touchRect) { return }
		var touch = e.touches[0]
		if (this.__touchRect.containsPoint({ x:touch.pageX, y:touch.pageY })) { return }
		clearState.apply(this)
		this.removeClass('active')
	}
}

// HACK this function has a bunch of clover list specific details in it. Abstract it up to a list level
function endTouch(tapHandler, e) {
	if (!this.__touchRect) { return }
	if (e.changedTouches.length > 1) { return }
	e.cancel()
	setTimeout(bind(this, function() { // Give the scroll event a chance to happen
		if (gLastScroll && (new Date().getTime() - gLastScroll < 100)) {
			gLastScroll = null
			clearState.call(this)
			this.removeClass('active')
			return;
		}
		var touch = e.changedTouches[0],
			shouldTap = (this.__touchRect.containsPoint({ x:touch.pageX, y:touch.pageY }))
		setTimeout(bind(this, this.removeClass, 'active'), 200)
		if (shouldTap && !this.hasClass('active')) {
			this.addClass('active')
			clearState.call(this)
			if (shouldTap) { setTimeout(tapHandler, 0) }
		} else {
			clearState.apply(this)
			if (shouldTap) { tapHandler() }
		}
		
	}), 50)
}

function clearState() {
	delete this.__touchRect
	clearTimeout(this.__activeDelayTimeout)
	delete this.__activeDelayTimeout
}

function onMouseDown(tapHandler, e) {
	e.cancel()
	this.__tappableMouseUpHandler = tapHandler
	on(document, 'mouseup', bind(this, _onMouseUp))
	this.on('mouseout', _onMouseOut)
	this.on('mouseover', _onMouseOver)
	this.addClass('active')
}

function _onMouseOut() {
	this.removeClass('active')
}

function _onMouseOver() {
	this.addClass('active')
}

function _onMouseUp(e) {
	var tapHandler = this.__tappableMouseUpHandler
	delete this.__tappableMouseUpHandler
	this.off('mouseout', _onMouseOut)
	this.off('mouseover', _onMouseOver)
	off(document, 'mouseup', this.__tappableMouseUpHandler)
	if (this.hasClass('active')) { tapHandler() }
}
