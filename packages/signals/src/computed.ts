import { signal, type Signal } from './signal.ts';
import { effect } from './effect.ts'; // effect returns dispose now

export interface ReadOnlySignal<T> {
	get(): T;
}

export function computed<T>(fn: () => T): ReadOnlySignal<T> {
	const s = signal<T>(undefined as unknown as T);

	effect(() => {
		s.set(fn());
	});

	return {
		get() {
			return s.get();
		}
	};
}
