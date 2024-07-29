export function subscribe(eventName: string, listener: EventListenerOrEventListenerObject) {
	document.addEventListener(eventName, listener);
}

export function unsubscribe(eventName: string, listener: EventListenerOrEventListenerObject) {
	document.removeEventListener(eventName, listener);
}

export function publish(eventName: string, payload?: any) {
	const event = new CustomEvent(eventName, {
		detail: payload,
		bubbles: true,
		cancelable: true,
		composed: false
	});
	document.dispatchEvent(event);
}
