export interface Subscriber {
	execute(): void;
	dependencies: Set<Set<Subscriber>>;
}

export let currentSubscriber: Subscriber | null = null;

export function setCurrentSubscriber(subscriber: Subscriber | null) {
	currentSubscriber = subscriber;
}
