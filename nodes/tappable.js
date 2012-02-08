var Rect = require('std/math/Rect'),
	curry = require('std/curry'),
	client = require('std/client'),
	bind = require('std/bind')

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
			click: tapHandler,
			mousedown: setActive,
			mouseup: setInactive,
			mouseout: setInactive
		})
}

var preventScroll = {
	onTouchStart: function(e) {
		// TODO Don't listen to move, end or cancel until touch start
		if (e.touches.length > 1) { return }
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
		}), 135)
	},
	onTouchMove: function(e) {
		if (!this.__touchRect) { return }
		var touch = e.touches[0]
		if (this.__touchRect.containsPoint({ x:touch.pageX, y:touch.pageY })) { return }
		clearState.apply(this)
	}
}

function endTouch(tapHandler, e) {
	if (!this.__touchRect) { return }
	e.cancel()
	var shouldTap = this.hasClass('active')
	clearState.apply(this)
	if (shouldTap) { tapHandler() }
}

function clearState() {
	delete this.__touchRect
	clearTimeout(this.__activeDelayTimeout)
	delete this.__activeDelayTimeout
	this.removeClass('active')
}

function setActive() {
	this.addClass('active')
}

function setInactive() {
	this.removeClass('active')
}