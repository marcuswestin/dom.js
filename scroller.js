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
		var contentSize = style({ height:viewport.height()-this.headHeight, widht:viewport.width() })
		var crop = style({ overflowX:'hidden' })
		var scrollable = style({ 'overflow-y':'scroll', '-webkit-overflow-scrolling':'touch' })
		var floating = style({ 'float':'left' })
		var sliderStyle = style({
			height:viewport.height() - this.headHeight,
			width:viewport.width() * numViews,
			'-webkit-transition':'-webkit-transform 0.70s',
			position:'relative'
		})
		
		this.body=div('scroller-body', style({ position:'absolute', top:this.headHeight, overflowX:'hidden' }),
			div('scroller-overflow', contentSize, crop,
				this._slider=div('scroller-slider', style(sliderStyle),
					this._views=map(new Array(numViews), function() {
						return div('scroller-view', contentSize, crop, floating, scrollable)
					})
				)
			)
		)
		this.push({})
		return this.body
	},
	push:function(view) {
		this.stack.push(view)
		this.head.empty().append(this.renderHeadContent(view))
		this._views[this.stack.length - 1].empty().append(this.renderBodyContent(view))
		this._scroll()
	},
	pop:function() {
		var stack = this.stack
		stack[stack.length - 1].remove()
		stack.pop()
		this._scroll()
	},
	_scroll:function() {
		$(this._slider).css('-webkit-transform', 'translateX('+(-this.stack.length * viewport.width())+'px)')
	}
}
