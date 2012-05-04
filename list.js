module.exports = function list(items, onSelect, render) {
	return div('list', function(tag) {
		var data = { id:0 }
		tag.append(map(items, function(item) {
			var id = data.id++
			data[id] = item
			return div('list-item', { listId:id }, render(item))
		}))
		$(tag).on('mousedown', '.list-item', function(event) {
			onSelect(data[$(this).attr('listId')])
		})
	})
}