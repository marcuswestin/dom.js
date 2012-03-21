var hasClass = require('./hasClass')

module.exports = function(el, className) {
	if (el.classList) {
		el.classList.add(className)
	} else {
		if (hasClass(el, className)) { return }
		el.className += ' ' + className
	}
}
