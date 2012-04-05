var on = require('./on'),
	each = require('std/each'),
	invokeWith = require('std/invokeWith')

module.exports = {
	get:get,
	set:set,
	getData:getData,
	setData:setData,
	updateData:updateData,
	observe:observe,
	push:push,
	pop:pop,
	replace:replace
}

function replace(hash) {
	var locationWithoutHash = location.toString().split('#')[0]
	location.replace(locationWithoutHash + '#' + hash)
	onHashChange()
}

function push(component) {
	var hash = get()
	set(hash ? hash+'/'+component : component)
}

function pop() {
	var parts = get().split('/')
	parts.pop()
	set(parts.join('/'))
}

function get() {
	var match = location.href.match(/#(.*)/)
	return match ? match[1] : ''
}

function set(hash) {
	location.hash = '#'+hash
	onHashChange()
}

function getData() {
	try { return JSON.parse(decodeURIComponent(get())) }
	catch(e) { return {} }
}

function setData(state) {
	set(encodeURIComponent(JSON.stringify(state)))
}

function updateData(key, val) {
	var currentState = getData()
	if (arguments.length == 1) {
		var updateWith = key
		each(updateWith, function(val, key) { currentState[key] = val })
	} else {
		currentState[key] = val
	}
	setData(currentState)
}

var observers = []
function observe(callback) {
	observers.push(callback)
	callback(get())
}

var lastHash = get()
function onHashChange() {
	var hash = get()
	if (hash == lastHash) { return }
	lastHash = hash
	each(observers, invokeWith(get()))
}

if ('onhashchange' in window) {
	on(window, 'hashchange', onHashChange)
} else {
	var lastIntervalHash = get()
	setInterval(function() {
		if (get() == lastIntervalHash) { return }
		lastIntervalHash = get()
		onHashChange()
	}, 200)
}
