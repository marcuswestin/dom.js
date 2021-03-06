var Class = require('std/Class'),
	Publisher = require('std/Publisher'),
	create = require('./create'),
	style = require('./style'),
	getOffset = require('./getOffset'),
	on = require('./on'),
	off = require('./off'),
	addClass = require('./addClass'),
	removeClass = require('./removeClass'),
	hasClass = require('./hasClass'),
	getDocumentOf = require('./getDocumentOf'),
	getElementOf = require('./getElementOf'),
	getWindowOf = require('./getWindowOf'),
	each = require('std/each'),
	bind = require('std/bind')

module.exports = Class(Publisher, function() {

	this._tag = 'div'
	this._class = ''

	this.init = function() {
		Publisher.prototype.init.apply(this)
	}

	this.render = function(inComponent) {
		this._render(inComponent, getDocumentOf(inComponent))
		return this
	}

	this._render = function(inComponent, inDocument) {
		var isElement = (inComponent instanceof Element)

		if (this._doc == inDocument && !isElement) { return this._el }
		if (this._el) { this.unrender() }
		
		this._doc = inDocument
		this._el = isElement ? inComponent : this._doc.createElement(this._tag)
		if (this._class) { this._el.className = this._class }
		if (this.renderContent) { this.renderContent() }
		if (this._styles) { this.style(this._styles); delete this._styles }
		return this._el
	}

	this.getElement = function() { return this._el }
	this.getDocument = function() { return this._doc }
	this.getWindow = function() { return getWindowOf(this._doc) }

	this.create = function(tag, properties) { return create(tag, properties, this._doc) }

	this.append = function(/* node1, node2, ... */) {
		var lastNode
		each(arguments, this, function(node) {
			if (!node) { return }
			this._el.appendChild(getElementOf(node.render ? node.render(this) : node))
			lastNode = node
		})
		return lastNode
	}
	this.appendTo = function(node) { getElementOf(node).appendChild(this._render(null, getDocumentOf(node))); return this }
	this.prepend = function() {
		for (var i=0; i<arguments.length; i++) { this.insert(arguments[i], i) }
		return this
	}
	this.insert = function(node, index) {
		var el = this._el,
			nodeEl = getElementOf(node.render ? node.render(this) : node)
		if (index >= el.childNodes.length) { el.appendChild(nodeEl) }
		else { el.insertBefore(nodeEl, el.childNodes[index]) }
		return this
	}
	this.replaceWith = function(node) {
		this._el.parentNode.insertBefore(getElementOf(node.render ? node.render(this) : node), this._el);
		this.remove()
		return node
	}

	this.hide = function() { this._el.style.display = 'none'; return this }
	this.show = function() { this._el.style.display = 'block'; return this }
	
	this.on = function(eventName, handler) { return on(this._el, eventName, handler) }
	this.off = function(eventName, handler) { return off(this._el, eventName, handler) }

	this.addClass = function(className) { (this._el ? addClass(this._el, className) : this._class += (' ' + className)); return this }
	this.removeClass = function(className) { removeClass(this._el, className); return this }
	this.toggleClass = function(className, shouldHave) {
		if (typeof shouldHave != 'boolean') { shouldHave = !hasClass(this._el, className) }
		(shouldHave ? addClass : removeClass)(this._el, className)
		return this
	}
	this.hasClass = function(className) { return hasClass(this._el, className) }
	this.style = function(styles) {
		if (this._el) {
			style(this._el, styles)
		} else {
			if (!this._styles) { this._styles = {} }
			each(styles, bind(this, function(val, key) { this._styles[key] = val }))
		}
		return this
	}
	this.opacity = function(opacity) { style.opacity(this._el, opacity); return this }

	this.getOffset = function() { return getOffset(this._el) }
	this.getWidth = function() { return this._el.offsetWidth }
	this.getHeight = function() { return this._el.offsetHeight }

	this.remove = function() { if (this._el.parentNode) { this._el.parentNode.removeChild(this._el); } return this }
	this.empty = function() { if (this._el) { this._el.innerHTML = ''; } return this }

	this.text = function(t) { this.empty()._el.appendChild(this._doc.createTextNode(t)); return this }
})