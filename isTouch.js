try {
	document.createEvent("TouchEvent")
	module.exports = ('ontouchstart' in window)
} catch (e) {
	module.exports = false
}
