// TODO: Proper documentation
// TODO: amd/commonjs?
// TODO Shadow Dom?
// TODO: Document Fragment?

'use strict';

/**
 * Rewind Time - This handy widget creates an input range element that constantly updates the time to the "present"
 * It returns an object literal that allows you to register an event to "now".
 *
 * @param element : Element we will render our rewind time widget in
 * @param renderTime : Optional Override for the time render
 *
 * @returns {{input: HTMLElement, isRewind: Function, registerEvent: Function}}
 */
function rewindTime(element, renderTimeOverride) {

	// Because native time rendering can differ from browser-to-browser, I made this instead.
	// Feel free to overwrite it.
	var renderTime = renderTimeOverride || function (myTime) {

		var hours = myTime.getHours(),
			minutes = myTime.getMinutes(),
			seconds = myTime.getSeconds();

		return [
			hours,
			(minutes < 10 ? '0'+minutes : minutes),
			(seconds < 10 ? '0'+seconds : seconds)
		].join(':');
	};

	// TODO: consider abstracting this out or putting in dom fragment
	var $wrapper = document.querySelector(element),
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

		eventMap = {};

	// Update the text content for all our dom elements
	[$start, $currentTime, $inputTime].forEach(function(timeElement) {
		timeElement.textContent = renderTime(now);
	});

	// Set our rewind input's attributes
	(Object.keys(inputAttributes)).forEach(function(keyName){
		$timeRange.setAttribute(keyName, inputAttributes[keyName]);
	});

	// Immediately update the time on change
	$timeRange.onchange = function() {

		var currentValue = $timeRange.value,
			tempValue = currentValue > 0 ? currentValue - 1 : currentValue,
			inputTime = new Date(nowTime + tempValue * 1000);
		$inputTime.textContent = renderTime(inputTime);
	};

	// Append rewind elements in order
	[$start, $timeRange, $currentTime, $inputTime].forEach(function(rewindElement) {
		$wrapper.appendChild(rewindElement);
	});

	// Every second, run our "update" step again
	setInterval(function() {
		var maxTime = new Date(nowTime + $timeRange.max * 1000),
			inputTime = new Date(nowTime + $timeRange.value * 1000);

		$timeRange.max++;
		$timeRange.value++;

		$currentTime.textContent = renderTime(maxTime);
		$inputTime.textContent = renderTime(inputTime);

		// The widget's soul is right here:
		if(eventMap[$timeRange.value]) {
			eventMap[$timeRange.value].forEach(function(timeEvent) {
				timeEvent();
			});
		}

	}, 1000);

	return {
		input: $timeRange,

		// If we need to check the state of our widget, this function can help
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