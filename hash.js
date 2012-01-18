var on = require('dom/on'),
	each = require('std/each'),
	invokeWith = require('std/invokeWith')

module.exports = {
	get:get,
	set:set,
	getState:getState,
	setState:setState,
	updateState:updateState,
	observe:observe
}

function get() {
	var hash = decodeURIComponent(location.href.split('#')[1]) // Damn Firefox! http://stackoverflow.com/questions/1703552/encoding-of-window-location-hash
	return hash
}

function set(to) {
	var hash = encodeURIComponent(to)
	location.hash = '#'+hash
}

function getState() {
	try { return JSON.parse(get()) }
	catch(e) { return {} }
}

function setState(state) {
	set(JSON.stringify(state))
}

function updateState(key, val) {
	var currentState = getState()
	if (arguments.length == 1) {
		var updateWith = key
		each(updateWith, function(val, key) { currentState[key] = val })
		setState(currentState)
	} else {
		currentState[key] = val
	}
	setState(currentState)
}

var observers = []
function observe(callback) {
	observers.push(callback)
	callback(get())
}

function onHashChange() {
	var hash = get()
	try { hash = JSON.parse(hash) }
	catch(e) {}
	each(observers, invokeWith(hash))
}

if ('onhashchange' in window) {
	on(window, 'hashchange', onHashChange)
} else {
	var lastHash = get()
	setInterval(function() {
		if (get() == lastHash) { return }
		lastHash = get()
		onHashChange()
	}, 200)
}
