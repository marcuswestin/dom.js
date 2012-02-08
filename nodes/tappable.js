var Rect = require('std/math/Rect'),
	curry = require('std/curry'),
	client = require('std/client')

module.exports = {
	withScroll: withScroll,
	withoutScroll: withoutScroll
}

function withScroll(tapHandler) {
	return tappable(allowScrollHandler, tapHandler)
}

function withoutScroll(tapHandler) {
	return tappable(preventScrollHandler, tapHandler)
}

function tappable(touchMoveHandler, tapHandler) {
	return (client.isMobile
		? {
			touchstart: onTouchStart,
			touchmove: touchMoveHandler,
			touchend: curry(endTouch, tapHandler),
			touchcancel: curry(endTouch, tapHandler)
		} : {
			click: tapHandler,
			mousedown: setActive,
			mouseup: setInactive,
			mouseout: setInactive
		})
}

function onTouchStart(e) {
	// TODO Don't listen to move, end or cancel until touch start
	if (e.touches.length > 1) { return }
	// if (this.hasClass('disabled')) { return }
	var offset = this.getOffset()
	this.__touchRect = new Rect(offset.left, offset.top, offset.width, offset.height).pad(3)
	this.addClass('active')
}

function allowScrollHandler(e) {
	if (!this.__touchRect) { return }
	var touch = e.touches[0]
	if (this.__touchRect.containsPoint({ x:touch.pageX, y:touch.pageY })) { return }
	document.getElementsByClassName('logout')[0].innerHTML = "ASDASD"
	this.removeClass('active')
	delete this.__touchRect
}

function preventScrollHandler(e) {
	if (!this.__touchRect) { return }
	e.cancel()
	var touch = e.touches[0]
	if (this.__touchRect.containsPoint({ x:touch.pageX, y:touch.pageY })) {
		this.addClass('active')
	} else {
		this.removeClass('active')
	}
}

function endTouch(tapHandler, e) {
	if (!this.__touchRect) { return }
	delete this.__touchRect
	e.cancel()
	var shouldTap = this.hasClass('active')
	this.removeClass('active')
	if (shouldTap) { tapHandler() }
	// TODO deregister touch events
}

function setActive() {
	this.addClass('active')
}

function setInactive() {
	this.removeClass('active')
}