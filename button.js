var tapMap = { id:0 }

module.exports = function button(handler) {
	return function() {
		var id = tapMap.id++
		$(this).addClass('tap-button').attr('tap-id', id)
		tapMap[id] = handler
	}
}

$(document).on('click', '.tap-button', function(e) {
	var id = $(this).attr('tap-id')
	tapMap[id].call(this, e)
})
