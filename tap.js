var on = require('dom/on'),
	off = require('dom/off'),
	curry = require('std/curry'),
	Rect = require('std/math/Rect'),
	getOffset = require('dom/getOffset'),
	addClass = require('dom/addClass'),
	removeClass = require('dom/removeClass'),
	hasClass = require('dom/hasClass')

module.exports = {
	button:tappableButton
	// listItem:tappableListItem
}

function tappableButton(element, handler) {
	on(element, 'touchstart', curry(withoutScroll.onTouchStart, element, handler))
	on(element, 'mousedown', curry(withoutScroll.onMouseDown, element, handler))
}

var withoutScroll = {
	onTouchStart: function(el, handler, e) {
		if (hasClass(el, 'tap-disabled')) { return }
		var state = on.getElementMap(el),
			offset = getOffset(el)
		
		state.tapRect = new Rect(offset.left, offset.top, offset.width, offset.height).pad(12)
		state.tapHandler = handler
		
		addClass(el, 'tap-active')
		e.cancel()
		
		on(el, 'touchmove', curry(withoutScroll.onTouchMove, el))
		on(el, 'touchend', curry(withoutScroll.onTouchEnd, el))
		// on(this, 'touchcancel', withoutScroll.onTouchCancel)
	},
	onTouchMove: function(el, e) {
		e.cancel()
		
		var state = on.getElementMap(el),
			touch = e.touches[0]
		
		if (state.tapRect.containsPoint({ x:touch.pageX, y:touch.pageY })) {
			addClass(el, 'tap-active')
		} else {
			removeClass(el, 'tap-active')
		}
	},
	onTouchEnd: function(el, e) {
		e.cancel()
		var state = on.getElementMap(el)
		
		if (hasClass(el, 'tap-active')) { state.tapHandler.call(el, e) }
		
		removeClass(el, 'tap-active')
		
		withoutScroll.clearState(state)
	},
	
	clearState: function(state) {
		delete state.tapRect
		delete state.tapHandler
	},
	
	onMouseDown: function(el, handler, e) {
		if (hasClass(el, 'tap-disabled')) { return }
		e.cancel()
		addClass(el, 'tap-active')
		
		// Handle the click event
		var clickHandler
		on(el, 'click', clickHandler=function(e) {
			off(el, 'click', clickHandler)
			handler(e)
		})
		
		// Handle the styling
		var upHandler, outHandler, overHandler
		on(el, 'mouseout', outHandler=function() { removeClass(el, 'tap-active') })
		on(el, 'mouseover', overHandler=function() { addClass(el, 'tap-active') })
		on(document, 'mouseup', upHandler=function(e) {
			removeClass(el, 'tap-active')
			off(el, 'mouseout', outHandler)
			off(el, 'mouseover', overHandler)
		})
	}
}

// Make these accessible to the outside - fun's "tap" module depends on this
tappableButton.onTouchStart = withoutScroll.onTouchStart
tappableButton.onMouseDown = withoutScroll.onMouseDown
