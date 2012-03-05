var Class = require('std/Class'),
	each = require('std/each'),
	slice = require('std/slice'),
	isArguments = require('std/isArguments'),
	Component = require('./Component'),
	isArray = require('std/isArray'),
	arrayToObject = require('std/arrayToObject'),
	curry = require('std/curry'),
	bind = require('std/bind')

var _NODES = module.exports

_NODES.NODE = Class(Component, function() {

	this.init = function(args) {
		// No need to call Component.init - Nodes are not expected to publish
		this._args = args
		this._handlers = {}
	}

	this.on = function(eventName, handler) {
		if (this._el) {
			Component.prototype.on.call(this, eventName, this._handlers[eventName]=bind(this, handler))
		} else {
			var arg = {}
			arg[eventName] = handler
			this._args.push(arg)
		}
		return this
	}
	
	this.off = function(eventName) {
		Component.prototype.off.call(this, eventName, this._handlers[eventName])
		delete this._handlers[eventName]
		return this
	}

	this.attributeHandlers = {
		click: curry(this.on, 'click'),
		mousedown: curry(this.on, 'mousedown'),
		mouseup: curry(this.on, 'mouseup'),
		mouseover: curry(this.on, 'mouseover'),
		mouseout: curry(this.on, 'mouseout'),
		keypress: curry(this.on, 'keypress'),
		keydown: curry(this.on, 'keydown'),
		keyup: curry(this.on, 'keyup'),
		blur: curry(this.on, 'blur'),
		focus: curry(this.on, 'focus'),
		change: curry(this.on, 'change'),
		touchstart: curry(this.on, 'touchstart'),
		touchend: curry(this.on, 'touchend'),
		touchmove: curry(this.on, 'touchmove'),
		touchcancel: curry(this.on, 'touchcancel'),
		load: curry(this.on, 'load'),
		submit: curry(this.on, 'submit'),
		scroll: curry(this.on, 'scroll'),
		className: this.addClass,
		style: this.style
	}

	this._attributeAttributes = { 'for':1 }

	this.renderContent = function() {
		var args = this._args
		if (typeof args[0] == 'string') {
			this._el.className = args[0]
			this._processArgs(args, 1)
		} else {
			this._processArgs(args, 0)
		}
	}

	this._processArgs = function(args, index) {
		if (this._class) {
			this._el.className = this._class
		}
		while (index < args.length) {
			this._processArg(args[index++])
		}
	}

	this._processArg = function(arg) {
		if (arg == null) { return }
		var node = this._el,
			doc = this._doc
		if (typeof arg._render == 'function') {
			node.appendChild(arg._render(null, doc))
		} else if (typeof arg == 'string' || typeof arg == 'number') {
			node.appendChild(doc.createTextNode(arg))
		} else if (arg.nodeType && arg.nodeType == 1) { // http://stackoverflow.com/questions/120262/whats-the-best-way-to-detect-if-a-given-javascript-object-is-a-dom-element
			node.appendChild(arg)
		} else if (isArray(arg)) {
			this._processArgs(arg, 0)
		} else {
			each(arg, this, function(val, key) {
				if (this.attributeHandlers[key]) {
					this.attributeHandlers[key].call(this, val)
				} else {
					if (this._attributeAttributes[key]) { node.setAttribute(key, val) }
					else { node[key] = val }
				}
			})
		}
	}

	this.append = function() {
		if (this._el) { this._processArgs(arguments, 0) }
		else { this._args = this._args.concat(slice(arguments)) }
		return this
	}
	
	this.text = function(text) {
		if (this._el) { Component.prototype.text.apply(this, arguments) }
		else { this._args.push(text.toString()) }
		return this
	}
})

_NODES.TEXT = Class(_NODES.NODE, function() {
	this._render = function(el, doc) {
		var args = this._args,
			text = args.length > 1 ? slice(args).join(' ') : args[0]
		return doc.createTextNode(text)
	}
})

_NODES.HTML = Class(_NODES.NODE, function() {
	this._render = function(el, doc) {
		var args = this._args,
			html = args.length > 1 ? slice(args).join(' ') : args[0],
			fragment = doc.createElement('span')
		fragment.innerHTML = html
		return fragment
	}
})

_NODES.FRAGMENT = Class(_NODES.NODE, function() {
	this.render = function(doc) {
		this._el = doc.createDocumentFragment()
		this._processArgs(this._args, 0)
		return this._el
	}
})

_NODES.attributeHandlers = _NODES.NODE.prototype.attributeHandlers

_NODES.createGenerator = function(tag, methods) {
	var ClassDefinition = Class(_NODES.NODE, function() {

		this._tag = tag

		each(methods, this, function(method, name) {
			this[name] = method
		})

	})
	return function() { return new ClassDefinition(slice(arguments, 0)) }
}

_NODES.createGeneratorWithoutClass = function(tag) {
	var ClassDefinition = Class(_NODES.NODE, function() { this._tag = tag })
	return function() { return new ClassDefinition([null].concat(slice(arguments, 0))) }
}

_NODES.INPUT = _NODES.createGenerator('INPUT', {
	'value':function(val) { if (typeof val != 'undefined') { this._el.value = val; return this } else { return this._el.value } },
	'select':function() { this._el.select(); return this },
	'focus':function() { this._el.focus(); return this },
	'blur':function() { this._el.blur(); return this },
	'disable':function() { this._el.disabled = true; return this },
	'enable':function() { this._el.disabled = false; return this }
})

FORM = _NODES.createGenerator('FORM', {
	'renderContent':function() {
		_NODES.NODE.prototype.renderContent.apply(this)
		this.getElement().action = '#'
		this.append(INPUT({ type:'submit' }).style({ visibility:'hidden', position:'absolute', top:-9999, left:-9999 }))
	}
})


_NODES.exposeGlobals = function() {
	TEXT = function() { return new _NODES.TEXT(slice(arguments, 0)) }
	FRAGMENT = function() { return new _NODES.FRAGMENT(slice(arguments, 0)) }
	HTML = function() { return new _NODES.HTML(slice(arguments, 0)) }
	DIV = _NODES.createGenerator('DIV')
	SPAN = _NODES.createGenerator('SPAN')
	IMG = _NODES.createGenerator('IMG')
	A = _NODES.createGenerator('A')
	P = _NODES.createGenerator('P')
	H1 = _NODES.createGenerator('H1')
	H2 = _NODES.createGenerator('H2')
	H3 = _NODES.createGenerator('H3')
	H4 = _NODES.createGenerator('H4')
	UL = _NODES.createGenerator('UL')
	LI = _NODES.createGenerator('LI')
	OL = _NODES.createGenerator('OL')
	IFRAME = _NODES.createGenerator('IFRAME')
	BUTTON = _NODES.createGenerator('BUTTON')
	INPUT = _NODES.INPUT
	PASSWORD = _NODES.createGenerator('INPUT', { type:'password' })
	TEXTAREA = _NODES.createGenerator('TEXTAREA')
	LABEL = _NODES.createGenerator('LABEL')
	TEXT = _NODES.createGeneratorWithoutClass('SPAN')
	BR = _NODES.createGenerator('BR')
	NODES = _NODES
}
