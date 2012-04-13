module.exports = function setAttribute(element, attribute, value) {
	if (element.setAttribute) {
		element.setAttribute(attribute, value)
	} else {
		element[attribute] = value
	}
	return value
}