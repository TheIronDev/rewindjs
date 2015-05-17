// TODO: Proper documentation
// TODO: amd/commonjs?
// TODO Shadow Dom?
// TODO: Document Fragment?

/**
 * Rewind Time
 * @param element : Element we will render our rewind time widget in
 * @param renderTime : Optional Override for the time render
 */
function rewindTime(element, renderTimeOverride) {

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
			max: 0
		};

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

	// Every second, run our "update" step
	setInterval(function() {
		var maxTime = new Date(nowTime + $timeRange.max * 1000),
			inputTime = new Date(nowTime + $timeRange.value * 1000);

		$timeRange.max++;
		$timeRange.value++;

		$currentTime.textContent = renderTime(maxTime);
		$inputTime.textContent = renderTime(inputTime);
	}, 1000);
}