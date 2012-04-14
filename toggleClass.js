var hasClass = require('./hasClass'),
	addClass = require('./addClass'),
	removeClass = require('./removeClass')

module.exports = function toggleClass(el, className, shouldHave) {
	if (typeof shouldHave != 'boolean') {
		shouldHave = !hasClass(el, className)
	}
	(shouldHave ? addClass : removeClass)(el, className)
}
