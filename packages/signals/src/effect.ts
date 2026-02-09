import {
	currentSubscriber,
	setCurrentSubscriber,
	type Subscriber,
} from "./context.ts";

export function effect(fn: () => void): () => void {
	const run: Subscriber = {
		execute: () => {
			cleanup(run);
			const prev = currentSubscriber;
			setCurrentSubscriber(run);
			try {
				fn();
			} finally {
				setCurrentSubscriber(prev);
			}
		},
		dependencies: new Set(),
	};

	function cleanup(subscriber: Subscriber) {
		for (const dep of subscriber.dependencies) {
			dep.delete(subscriber);
		}
		subscriber.dependencies.clear();
	}

	run.execute();

	return () => cleanup(run);
}
