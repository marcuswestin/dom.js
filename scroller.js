var viewport = require('dom/viewport')

module.exports = function() {
	return create(scroller, { stack:[], viewContents:[] })
}

var scroller = {
	renderHead:function(headHeight, renderHeadContent) {
		this.renderHeadContent = renderHeadContent
		this.headHeight = headHeight
		return this.head=div('scroller-head', style({ height:headHeight, width:'100%', position:'relative', top:0, zIndex:1 }))
	},
	renderBody:function(numViews, renderBodyContent) {
		this.renderBodyContent = renderBodyContent
		var viewSize = { height:viewport.height()-this.headHeight, width:viewport.width() }
		var viewSized = style(viewSize)
		// view content size is 1px extra in height to ensure that overflow scrolling is always on
		// var contentSized = style({ width:viewSize.width, 'min-height':viewSize.height+1 })
		var cropped = style({ overflowX:'hidden' })
		var scrollable = style({ 'overflow-y':'scroll', '-webkit-overflow-scrolling':'touch' })
		var floating = style({ 'float':'left' })
		var sliderStyle = style({
			height:viewport.height() - this.headHeight,
			width:viewport.width() * numViews,
			'-webkit-transition':'-webkit-transform 0.70s',
			position:'relative'
		})
		
		this.body=div('scroller-body', style({ position:'absolute', top:this.headHeight, overflowX:'hidden' }),
			div('scroller-overflow', viewSized, cropped,
				this._slider=div('scroller-slider', sliderStyle,
					map(new Array(numViews), this, function(_, i) {
						return div('scroller-view', viewSized, cropped, floating, scrollable,
							this.viewContents[i] = div('scroller-content')
						)
					})
				)
			)
		)
		this.push({})
		return this.body
	},
	push:function(newView) {
		var viewContents = this.viewContents
		var stack = this.stack
		var viewBelow = viewContents[stack.length - 1]
		this.stack.push(newView)
		this.head.empty().append(this.renderHeadContent(newView, viewBelow))
		viewContents[this.stack.length - 1].empty().append(this.renderBodyContent(newView, viewBelow))
		this._scroll()
	},
	pop:function() {
		var stack = this.stack
		var fromView = stack.pop()
		var currentView = stack[stack.length - 1]
		var viewBelow = stack[stack.length - 2]
		this.head.empty().append(this.renderHeadContent(currentView, viewBelow, fromView))
		this._scroll()
	},
	_scroll:function() {
		var offset = this.stack.length - 1
		$(this._slider).css('-webkit-transform', 'translateX('+(-offset * viewport.width())+'px)')
	}
}
