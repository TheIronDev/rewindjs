// TODO: Proper documentation
// TODO: amd/commonjs?
// TODO Shadow Dom?

'use strict';

/**
 * Rewind Time - This handy widget creates an input range element that constantly updates the time to the "present"
 * It returns an object literal that allows you to register events to get triggered when you rewind.
 *
 * @param element           : Element we will render our rewind time widget in
 * @param config            : Optional Configuration to update and alter this widget
 *  @param renderTime       : Override for the time render. Defaults to a function that renders HH:MM:SS
 *  @param tickDuration     : Override the amount of time to process next tick, defaults to 1000
 *  @param classBlockName   : Override the class prepended to all the elements, defaults to "rewindjs"
 *
 * @returns {{input: HTMLElement, isRewind: Function, registerEvent: Function}}
 */
function rewindTime(element, config) {

	// Null safe-ing our config
	config = config || {};

	var fragment = document.createDocumentFragment(),
		$wrapper = document.querySelector(element),
		$start = document.createElement('span'),
		$timeRange = document.createElement('input'),
		$currentTime = document.createElement('span'),
		$inputTime = document.createElement('div'),

		now = new Date(),
		nowTime = now.getTime(),

		inputAttributes = {
			type: 'range',
			min: 0,
			max: 1,
			value: 1
		},

		elements = {
			wrapper: $wrapper,
			start:$start,
			timeRange:$timeRange,
			currentTime:$currentTime,
			inputTime: $inputTime
		},

		// Update Config-based variables (or fallback to defaults)
		classBlockName = config.classBlockName || 'rewindjs',
		tickDuration = config.tickDuration || 1000,
		renderTime = config.renderTime || function (myTime) {
				var hours = myTime.getHours(),
					minutes = myTime.getMinutes(),
					seconds = myTime.getSeconds();

				return [
					hours,
					(minutes < 10 ? '0'+minutes : minutes),
					(seconds < 10 ? '0'+seconds : seconds)
				].join(':');
			},

		eventMap = {};

	// Update the text content for all our dom elements
	[$start, $currentTime, $inputTime].forEach(function(timeElement) {
		timeElement.textContent = renderTime(now);
	});

	// Apply Classnames so the end-user can style
	(Object.keys(elements)).forEach(function(elementName) {
		elements[elementName].className = classBlockName +'_' + elementName;
	});

	// Set our rewind input's attributes
	(Object.keys(inputAttributes)).forEach(function(keyName){
		$timeRange.setAttribute(keyName, inputAttributes[keyName]);
	});

	// Immediately update the time on change
	$timeRange.onchange = function() {

		var currentValue = $timeRange.value,
			tempValue = currentValue > 0 ? currentValue - 1 : currentValue,
			inputTime = new Date(nowTime + tempValue * tickDuration);
		$inputTime.textContent = renderTime(inputTime);
	};

	// Append the rewindjs elements in order
	[$start, $timeRange, $currentTime, $inputTime].forEach(function(rewindElement) {
		fragment.appendChild(rewindElement);
	});
	$wrapper.appendChild(fragment);

	function processRewindJSNextTick() {
		var maxTime = new Date(nowTime + $timeRange.max * tickDuration),
			inputTime = new Date(nowTime + $timeRange.value * tickDuration);

		$timeRange.max++;
		$timeRange.value++;

		$currentTime.textContent = renderTime(maxTime);
		$inputTime.textContent = renderTime(inputTime);

		// The widget's soul is right here:
		(eventMap[$timeRange.value] || []).forEach(function(timeEvent) {
			timeEvent();
		});
	}

	// Every second, run our "update" step again
	setInterval(processRewindJSNextTick, tickDuration);

	return {
		input: $timeRange,

		// If we need to check the state of our widget, this function can help!
		isRewind: function() {
			return $timeRange.max !== $timeRange.value
		},

		// Register an event that can get retriggered when we rewind.
		registerEvent: function(myEvent) {

			// The max represents the most current version of "now"
			var currentTime = $timeRange.max;
			if (!eventMap[currentTime]) {
				eventMap[currentTime] = [];
			}
			eventMap[currentTime].push(myEvent);
			return currentTime;
		}
	};
}