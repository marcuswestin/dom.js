module.exports = function(element, attribute) {
	if (element.getAttribute) {
		return element.getAttribute(attribute)
	} else {
		return element[attribute]
	}
}