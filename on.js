var unique = require('std/unique'),
	curry = require('std/curry'),
	client = require('std/client'),
	getWindowScroll = require('./getWindowScroll'),
	proto = require('std/proto'),
	getAttribute = require('./getAttribute'),
	setAttribute = require('./setAttribute')

module.exports = function on(element, eventName, handler) {
	var uniqueID = module.exports.stampElement(element),
		map = module.exports._elementMaps[uniqueID]
	if (!map) { map = module.exports._elementMaps[uniqueID] = {} }

	var eventListeners = map[eventName]
	if (!eventListeners) {
		eventListeners = map[eventName] = []
		eventListeners._realHandler = curry(module.exports._handleEvent, element, eventName)
		module.exports._addListener(element, eventName, eventListeners._realHandler)
	}
	eventListeners.push(handler)
}

module.exports._idNamespace = '__onID'
module.exports._elementMaps = {}

module.exports.stampElement = function(element) {
	var uniqueID = getAttribute(element, module.exports._idNamespace)
	if (!uniqueID) {
		uniqueID = unique()
		setAttribute(element, module.exports._idNamespace, uniqueID)
	}
	return uniqueID
}

module.exports.getElementMap = function(element) {
	var uniqueID = getAttribute(element, module.exports._idNamespace)
	return uniqueID && module.exports._elementMaps[uniqueID]
}

module.exports._addListener = function(element, eventName, handler) {
	if (window.addEventListener) {
		module.exports._addListener = function(element, eventName, handler) {
			if (eventName == 'mousewheel' && client.isFirefox) { eventName = 'MozMousePixelScroll' }
			element.addEventListener(eventName, handler, false)
		}
	} else if (window.attachEvent) {
		module.exports._addListener = function(element, eventName, handler) {
			element.attachEvent('on'+eventName, handler)
		}
	} else {
		module.exports._addListener = null
	}
	
	module.exports._addListener(element, eventName, handler)
}

module.exports._handleEvent = function(element, eventName, e) {
	var eventObj = module.exports.normalizeEvent(eventName, e),
		elementMap = module.exports.getElementMap(element),
		handlers = elementMap[eventName]
	for (var i=0; i<handlers.length; i++) {
		handlers[i].call(element, eventObj)
	}
}

var charCodes = {
	'c': 99,
	'r': 114
}

var keyCodes = {
	'tab': 9,
	'backspace': 8,
	'return': 13
}

var eventBase = {
	cancel: function() {
		var e = this.domEvent
		if (e.preventDefault) { e.preventDefault() }
		else { e.returnValue = false }
	},
	isCopy: function() {
		var e = this.domEvent
		return e.type == 'keypress' && e.metaKey && e.charCode == charCodes['c']
	},
	isRefresh: function() {
		var e = this.domEvent
		return e.type == 'keypress' && e.metaKey && e.charCode == charCodes['r']
	},
	isTab: function() {
		return this.keyCode == keyCodes['tab']
	},
	isBackspace:function() {
		return this.keyCode == keyCodes['backspace']
	},
	isReturn:function() {
		return this.keyCode == keyCodes['return']
	},
	_normalizeMouseWheel: function(eventName) {
		if (eventName != 'mousewheel') { return }
		// http://adomas.org/javascript-mouse-wheel/
		// https://developer.mozilla.org/en/Gecko-Specific_DOM_Events
		// TODO Normalize the values across browsers
		var e = this.domEvent
		if (typeof e.wheelDeltaX == 'number') {
			this.dx = -e.wheelDeltaX
			this.dy = -e.wheelDeltaY
		} else if (e.wheelDelta) {
			this.dy = -e.wheelDelta
		} else if (e.detail) {
			if (e.axis == e.HORIZONTAL_AXIS) { this.dx = e.detail }
			if (e.axis == e.VERTICAL_AXIS) { this.dy = e.detail }
		}
	},
	_normalizeXY: function(eventName, e) {
		var e = this.domEvent
		if (typeof e.pageX == 'number')   {
			this.x = e.pageX
			this.y = e.pageY
		} else if (typeof e.clientX == 'number') {
			var scroll = getWindowScroll(window)
			this.x = e.clientX + scroll.left
			this.y = e.clientY + scroll.top
		}
	},
	_normalizeKeyPress: function(eventName, e) {
		var e = this.domEvent
		if (e.type != 'keypress') { return }
		this.charCode = (this.charCode == 13 && this.keyCode == 13) 
			? 0 // in Webkit, return/enter key gives a charCode as well as a keyCode. Should only be a keyCode
			: e.charCode
	}
}
var Event = proto(eventBase,
	function(eventName, e) {
		this.domEvent = e
		this.keyCode = e.keyCode
		this.metaKey = e.metaKey
		this.target = e.target || e.srcElement
		this.source = e.source // postmessage
		this.origin = e.origin
		this.data = e.data
		this.touches = e.touches
		this.changedTouches = e.changedTouches
		this.type = e.type
		
		this._normalizeMouseWheel(eventName)
		this._normalizeXY()
		this._normalizeKeyPress()
	}
)

module.exports.normalizeEvent = function(eventName, e) {
	return new Event(eventName, e || event)
}
