module.exports = function removeClass(el, className) {
	if (el.classList) {
		el.classList.remove(className)
	} else {
		var current = ' ' + el.className + ' ',
			target = ' ' + className + ' ',
			index  = current.indexOf(target)

	  	if (index == -1) { return }
		el.className = current.replace(target, ' ')
	}
}