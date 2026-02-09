import { currentSubscriber, type Subscriber } from './context.ts';

export interface Signal<T> {
	get(): T;
	set(value: T): void;
}

export function signal<T>(initialValue: T): Signal<T> {
	let _value = initialValue;
	const subscribers = new Set<Subscriber>();

	return {
		get() {
			if (currentSubscriber) {
				subscribers.add(currentSubscriber);
				currentSubscriber.dependencies.add(subscribers);
			}
			return _value;
		},
		set(newValue: T) {
			if (_value !== newValue) {
				_value = newValue;
				const subs = [...subscribers];
				for (const sub of subs) {
					sub.execute();
				}
			}
		}
	};
}
