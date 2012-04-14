module.exports = function(el, className) {
	if (el.classList) {
		return el.classList.contains(className)
	} else {
		return (' ' + el.className + ' ').match(' ' + className + ' ')
	}
}