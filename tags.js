;(function() {
	var global = this
	
	var tags = {
		create: function(tagName, overrideRender) {
			var F = function(args) {
				this._args = slice(args)
				this._tag = tagName
				if (overrideRender) { this._renderTag = overrideRender }
			}
			F.prototype = tagPrototype
			return function tagCreator() { return new F(arguments) }
		},
		style: function(styles) {
			return { style:styles }
		},
		expose: function() {
			var tagNames = 'div,span,img,a,p,h1,h2,h3,h4,h5,h6,ol,ul,li,iframe,buttom,input,textarea,form,label,br'.split(',')
			for (var i=0, tagName; tagName=tagNames[i]; i++) {
				global[tagName] = tags.create(tagName)
			}
			global.raw = tags.create('span', function() {
				var container = document.createElement('span')
				container.innerHTML = slice(this._args).join(' ')
				return container
			})
			global.style = tags.style
		},
		enableJQueryTags: enableJQueryTags
	}
	
	var tagPrototype = {
		appendTo:function appendTo(tag) {
			(tag._el ? tag._el : tag).appendChild(this._renderTag())
			return this
		},
		append:function append() {
			var args = arguments
			if (this.el) { this._processArgs(args, 0) }
			else { this._args = this._args.concat(slice(args)) }
			return args[args.length - 1]
		},
		prepend:function prepend(tag) {
			var el = this.el
			var children = el.children
			tag = tag._renderTag ? tag._renderTag() : tag
			if (children.length) {
				el.insertBefore(tag, children[0])
			} else {
				el.appendChild(tag)
			}
			return this
		},
		empty:function empty() {
			if (this.el) { this.el.innerHTML = '' }
			return this
		},
		remove:function remove() {
			if (this.el) { this.el.parentNode.removeChild(this.el) }
			return this
		},
		_renderTag:function _renderTag() {
			this.el = document.createElement(this._tag)
			var args = this._args
			var index = 0
			if (typeof args[0] == 'string') {
				this.el.className = args[0]
				index = 1
			}
			this._processArgs(this._args, index)
			return this.el
		},
		_processArgs:function _processArgs(args, index) {
			while (index < args.length) {
				this._processArg(args[index++])
			}
		},
		_processArg:function _processArg(arg) {
			if (arg == null) { return } // null & undefined
			var el = this.el
			var type = typeof arg
			if (arg._renderTag) {
				el.appendChild(arg._renderTag())
			} else if (type == 'string' || type == 'number') {
				el.appendChild(document.createTextNode(arg))
			// http://stackoverflow.com/questions/120262/whats-the-best-way-to-detect-if-a-given-javascript-object-is-a-dom-element
			} else if (arg.nodeType && arg.nodeType == 1) {
				el.appendChild(arg)
			} else if (isArray(arg)) {
				this._processArgs(arg, 0)
			} else if (type == 'function') {
				arg.call(el, this)
			} else {
				for (var key in arg) {
					if (!arg.hasOwnProperty(key)) { continue }
					var val = arg[key]
					if (key == 'style') {
						for (var styleKey in val) { setStyle(el, styleKey, val[styleKey]) }
					} else {
						el.setAttribute(key, val)
					}
				}
			}
		}
	}
	
	// Adapted from https://gist.github.com/1034882
	var isArray = Array.isArray || function isArray(arr) {
		return '' + a !== a // is not the string '[object Array]' and
				&& {}.toString.call(a) == '[object Array]' // test with Object.prototype.toString
	}
	
	var slice = function(args) { return [].slice.call(args) }
	
	var setStyle = function(el, name, val) {
		if (typeof val == 'number' && name != 'opacity') { val += 'px' }
		else if (name == 'float') { name = 'cssFloat' }
		el.style[name] = val
	}
	
	if (typeof module != 'undefined' && typeof module != 'function') { module.exports = tags }
	else if (typeof define === 'function' && define.amd) { define(tags) }
	else { this.tags = tags }

	function enableJQueryTags() {
		var originalInit = jQuery.fn.init
		jQuery.fn.init = function() {
			var selector = arguments[0]
			if (selector && selector._renderTag) {
				arguments[0] = selector.el
			}
			return originalInit.apply(this, arguments)
		}
		jQuery.fn.init.prototype = originalInit.prototype
		
	}
})()
