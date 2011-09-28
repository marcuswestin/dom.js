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
	extend = require('std/extend')

module.exports = Class(Publisher, function() {

	this._tag = 'div'
	this._class = null

	this.init = function() {
		Publisher.prototype.init.apply(this)
	}

	this.render = function(component) {
		this._render(component)
		return this
	}

	this._render = function(component) {
		var doc = getDocumentOf(component)
		if (this._doc == doc) { return this._el }
		if (this._el) { this.unrender() }

		this._doc = doc
		this._el = doc.createElement(this._tag)
		if (this._class) { this._el.className = this._class }
		if (this._styles) { this.style(this._styles); delete this._styles }
		if (this.renderContent) { this.renderContent() }
		return this._el
	}

	this.getElement = function() { return this._el }
	this.getDocument = function() { return this._doc }
	this.getWindow = function() { return getWindowOf(this._doc) }

	this.create = function(tag, properties) { return create(tag, properties, this._doc) }

	this.append = function(node) { this._el.appendChild(getElementOf(node.render ? node.render(this) : node)); return node }
	this.appendTo = function(node) { getElementOf(node).appendChild(this._render(node)); return this }

	this.hide = function() { this._el.style.display = 'none'; return this }
	this.show = function() { this._el.style.display = 'block'; return this }
	
	this.on = function(eventName, handler) { return on(this._el, eventName, handler) }
	this.off = function(eventName, handler) { return off(this._el, eventName, handler) }

	this.addClass = function(className) { addClass(this._el, className); return this }
	this.removeClass = function(className) { removeClass(this._el, className); return this }
	this.toggleClass = function(className, shouldHave) { (shouldHave ? addClass : removeClass)(this._el, className); return this }
	this.hasClass = function(className) { return hasClass(this._el, className) }
	this.style = function(styles) {
		if (this._el) { style(this._el, styles) }
		else { this._styles = extend(this._styles, styles) }
		return this
	}
	this.opacity = function(opacity) { style.opacity(this._el, opacity); return this }

	this.getOffset = function() { return getOffset(this._el) }
	this.getWidth = function() { return this._el.offsetWidth }
	this.getHeight = function() { return this._el.offsetHeight }

	this.remove = function() { this._el.parentNode.removeChild(this._el); return this }
	this.empty = function() { this._el.innerHTML = ''; return this }
	this.text = function(text) { this.empty(); this._el.appendChild(this._doc.createTextNode(text)); return this }
})