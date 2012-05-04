var viewport = require('dom/viewport')

module.exports = function() {
	return create(scroller, { stack:[] })
}

var scroller = {
	renderHead:function(headHeight, renderHeadContent) {
		this.renderHeadContent = renderHeadContent
		this.headHeight = headHeight
		return this.head=div('scroller-head', style({ height:headHeight, width:'100%', position:'relative', top:0, zIndex:1 }))
	},
	renderBody:function(numViews, renderBodyContent) {
		this.renderBodyContent = renderBodyContent
		var viewportSize = viewport.getSize()
		var contentSize = style({ height:viewport.height()-this.headHeight, width:viewport.width() })
		var crop = style({ overflowX:'hidden' })
		var scrollable = style({ 'overflow-y':'scroll', '-webkit-overflow-scrolling':'touch' })
		var floating = style({ 'float':'left' })
		var slider = style({
			height:viewport.height() - this.headHeight,
			width:viewport.width() * numViews,
			'-webkit-transition':'-webkit-transform 0.70s',
			position:'relative'
		})
		
		this.body=div('scroller-body', style({ position:'absolute', top:this.headHeight, overflowX:'hidden' }),
			div('scroller-overflow', contentSize, crop,
				this._slider=div('scroller-slider', slider,
					this.views=map(new Array(numViews), function() {
						return div('scroller-view', contentSize, crop, floating, scrollable)
					})
				)
			)
		)
		this.push({})
		return this.body
	},
	push:function(newView) {
		var views = this.views
		var stack = this.stack
		var viewBelow = views[stack.length - 1]
		this.stack.push(newView)
		this.head.empty().append(this.renderHeadContent(newView, viewBelow))
		views[this.stack.length - 1].empty().append(this.renderBodyContent(newView, viewBelow))
		this._scroll()
	},
	pop:function() {
		var stack = this.stack
		var fromView = stack.pop()
		var currentView = stack[stack.length - 1]
		var viewBelow = stack[stack.length - 2]
		this.views[this.stack.length].empty()
		this.head.empty().append(this.renderHeadContent(currentView, viewBelow, fromView))
		
		this._scroll()
	},
	_scroll:function() {
		var offset = this.stack.length - 1
		$(this._slider).css('-webkit-transform', 'translateX('+(-offset * viewport.width())+'px)')
	}
}
