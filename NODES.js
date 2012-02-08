var Class = require('std/Class'),
	each = require('std/each'),
	slice = require('std/slice'),
	isArguments = require('std/isArguments'),
	Component = require('./Component'),
	isArray = require('std/isArray'),
	arrayToObject = require('std/arrayToObject'),
	curry = require('std/curry'),
	bind = require('std/bind')

var NODES = module.exports

NODES.NODE = Class(Component, function() {

	this.init = function(args) {
		// No need to call Component.init - Nodes are not expected to publish
		this._args = args
	}

	this.on = function(event, handler) {
		if (this._el) {
			Component.prototype.on.call(this, event, bind(this, handler))
		} else {
			var arg = {}
			arg[event] = handler
			this._args.push(arg)
		}
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
		while (index < args.length) {
			this._processArg(args[index++])
		}
	}

	this._processArg = function(arg) {
		if (arg == null) { return }
		var node = this._el,
			doc = this._doc
		if (typeof arg._render == 'function') {
			node.appendChild(arg._render(doc))
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
})

NODES.TEXT = Class(NODES.NODE, function() {
	this._render = function(doc) {
		var args = this._args,
			text = args.length > 1 ? slice(args).join(' ') : args[0]
		return doc.createTextNode(text)
	}
})

NODES.HTML = Class(NODES.NODE, function() {
	this._render = function(doc) {
		var args = this._args,
			html = args.length > 1 ? slice(args).join(' ') : args[0],
			fragment = doc.createElement('span')
		fragment.innerHTML = html
		return fragment
	}
})

NODES.FRAGMENT = Class(NODES.NODE, function() {
	this.render = function(doc) {
		this._el = doc.createDocumentFragment()
		this._processArgs(this._args, 0)
		return this._el
	}
})

NODES.attributeHandlers = NODES.NODE.prototype.attributeHandlers

NODES.createGenerator = function(tag, methods) {
	var ClassDefinition = Class(NODES.NODE, function() {

		this._tag = tag

		each(methods, this, function(method, name) {
			this[name] = method
		})

	})
	return function() { return new ClassDefinition(slice(arguments, 0)) }
}

NODES.createGeneratorWithoutClass = function(tag) {
	var ClassDefinition = Class(NODES.NODE, function() { this._tag = tag })
	return function() { return new ClassDefinition([null].concat(slice(arguments, 0))) }
}

NODES.INPUT = NODES.createGenerator('INPUT', {
	'value':function(val) { if (typeof val != 'undefined') { this._el.value = val; return this } else { return this._el.value } },
	'select':function() { this._el.select(); return this },
	'focus':function() { this._el.focus(); return this },
	'blur':function() { this._el.blur(); return this },
	'disable':function() { this._el.disabled = true; return this },
	'enable':function() { this._el.disabled = false; return this }
})

FORM = NODES.createGenerator('FORM', {
	'renderContent':function() {
		NODES.NODE.prototype.renderContent.apply(this)
		this.getElement().action = '#'
		this.append(INPUT({ type:'submit' }).style({ visibility:'hidden', position:'absolute', top:-9999, left:-9999 }))
	}
})


NODES.exposeGlobals = function() {
	TEXT = function() { return new NODES.TEXT(slice(arguments, 0)) }
	FRAGMENT = function() { return new NODES.FRAGMENT(slice(arguments, 0)) }
	HTML = function() { return new NODES.HTML(slice(arguments, 0)) }
	DIV = NODES.createGenerator('DIV')
	SPAN = NODES.createGenerator('SPAN')
	IMG = NODES.createGenerator('IMG')
	A = NODES.createGenerator('A')
	P = NODES.createGenerator('P')
	H1 = NODES.createGenerator('H1')
	H2 = NODES.createGenerator('H2')
	H3 = NODES.createGenerator('H3')
	H4 = NODES.createGenerator('H4')
	UL = NODES.createGenerator('UL')
	LI = NODES.createGenerator('LI')
	OL = NODES.createGenerator('OL')
	IFRAME = NODES.createGenerator('IFRAME')
	BUTTON = NODES.createGenerator('BUTTON')
	INPUT = NODES.INPUT
	TEXTAREA = NODES.createGenerator('TEXTAREA')
	LABEL = NODES.createGenerator('LABEL')
	TEXT = NODES.createGeneratorWithoutClass('SPAN')
	BR = NODES.createGenerator('BR')
}
