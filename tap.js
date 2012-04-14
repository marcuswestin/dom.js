window.onerror = function(e) { alert('error ' + e) }
var on = require('./on'),
	off = require('./off'),
	curry = require('std/curry'),
	Rect = require('std/math/Rect'),
	getOffset = require('./getOffset'),
	addClass = require('./addClass'),
	removeClass = require('./removeClass'),
	hasClass = require('./hasClass'),
	each = require('std/each')

module.exports = {
	button:tappableButton,
	listItem:tappableListItem
}

function tappableButton(element, handler) {
	on(element, 'touchstart', curry(withoutScroll.onTouchStart, element, handler))
	on(element, 'mousedown', curry(withoutScroll.onMouseDown, element, handler))
}

function tappableListItem(element, handler) {
	var clickHandler
	on(element, 'click', clickHandler=function(e) {
		off(element, 'click', clickHandler)
		clickHandler()
	})
	on(element, 'touchstart', curry(withScroll.onTouchStart, element, handler))
}

var withScroll = {
	onTouchStart: function(el, handler, e) {
		var scrollingEl = withScroll.getScrollingEl(el)
		
		var state = initTapState(el, handler, e)
		
		var touch = e.touches[0]
		state.tapPoint = { x:touch.pageX, y:touch.pageY }
		
		register(state, el, 'touchmove', withScroll.onTouchMove)
		register(state, el, 'touchend', withScroll.onTouchEnd)
		register(state, scrollingEl, 'scroll', withScroll.onScroll, el)
		
		state.tapSetActiveTimeout = setTimeout(function() { setActive(el) }, withScroll.delayUntilActive)
	},
	delayUntilActive: 150,
	onTouchMove: function(el, e) {
		var touch = e.touches[0],
			state = on.getElementMap(el)
		if (!touchInsideTapRect(el, e)) {
			onEnd(el, e, true)
		} else if (Math.abs(touch.pageY - state.tapPoint.y) > 3) {
			onEnd(el, e, true)
		}
	},
	onScroll: function(el, e) {
		onEnd(el, e, true)
	},
	onTouchEnd: function(el, e) {
		if (touchInsideTapRect(el, e)) { setActive(el) }
		onEnd(el, e)
	},
	getScrollingEl: function(el) {
		var scrollingEl = el.parentNode
		while(scrollingEl && !hasClass(scrollingEl, 'tap-list-scroller')) {
			scrollingEl = scrollingEl.parentNode
		}
		if (!scrollingEl) { return document }
	}
}

var withoutScroll = {
	onTouchStart: function(el, handler, e) {
		if (hasClass(el, 'tap-disabled')) { return }
		var state = initTapState(el, handler, e)
		
		setActive(el)
		e.cancel()
		
		register(state, el, 'touchmove', withoutScroll.onTouchMove)
		register(state, el, 'touchend', withoutScroll.onTouchEnd)
		register(state, el, 'touchcancel', withoutScroll.onTouchCancel)
	},
	onTouchMove: function(el, e) {
		e.cancel()
		
		if (touchInsideTapRect(el, e)) { setActive(el) }
		else { setInactive(el) }
	},
	onTouchEnd: function(el, e) {
		e.cancel()
		onEnd(el, e)
	},
	onTouchCancel: function(el, e) {
		onEnd(el, e, true)
	},
	
	onMouseDown: function(el, handler, e) {
		if (hasClass(el, 'tap-disabled')) { return }
		var state = initTapState(el, handler, e)
		
		e.cancel()
		setActive(el)
		
		register(state, el, 'mouseout', setInactive)
		register(state, el, 'mouseover', setActive)
		register(state, document, 'mouseup', onEnd, el)
	}
}

// Make these accessible to the outside - fun's "tap" module depends on this
tappableButton.onTouchStart = withoutScroll.onTouchStart
tappableButton.onMouseDown = withoutScroll.onMouseDown
tappableListItem.onTouchStart = withScroll.onTouchStart

var setActive = function(el) { addClass(el, 'tap-active') }
var setInactive = function(el) { removeClass(el, 'tap-active') }
var isActive = function(el) { return hasClass(el, 'tap-active') }

var onEnd = function(el, e, suppressTapHandler) {
	var state = on.getElementMap(el)
	
	clearTimeout(state.tapSetActiveTimeout)
	
	var tapHandler = isActive(el) && !suppressTapHandler && state.tapHandler
	
	each(state.eventHandlers, function(info) {
		off(info.eventEl, info.eventName, info.eventHandler)
	})
	
	delete state.tapRect
	delete state.tapHandler
	delete state.tapSetActiveTimeout
	delete state.eventHandlers
	
	setInactive(el)
	
	if (tapHandler) { tapHandler.call(el, e) }
}

var initTapState = function(el, handler, e) {
	var state = on.getElementMap(el),
		offset = getOffset(el)
	
	state.tapRect = new Rect(offset.left, offset.top, offset.width, offset.height).pad(12)
	state.tapHandler = handler
	state.eventHandlers = []
	
	return state
}

var register = function(state, eventEl, eventName, handler, tapEl) {
	if (!tapEl) { tapEl = eventEl }
	handler = curry(handler, tapEl)
	on(eventEl, eventName, handler)
	state.eventHandlers.push({ eventEl:eventEl, eventName:eventName, handler:handler })
}

var touchInsideTapRect = function(el, e) {
	var state = on.getElementMap(el),
		touch = e.changedTouches[0]
	return touch && state.tapRect.containsPoint({ x:touch.pageX, y:touch.pageY })
}
