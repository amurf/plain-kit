import { test } from 'node:test';
import assert from 'node:assert';
import { signal, effect, computed } from '../src/index.ts';

test('signal should hold a value', () => {
	const s = signal(1);
	assert.strictEqual(s.get(), 1);
	s.set(2);
	assert.strictEqual(s.get(), 2);
});

test('effect should run when signal changes', () => {
	const s = signal(1);
	let count = 0;

	effect(() => {
		// Access s.get() to subscribe
		s.get();
		count++;
	});

	assert.strictEqual(count, 1);
	s.set(2);
	assert.strictEqual(count, 2);
});

test('computed should update when dependencies change', () => {
	const s = signal(1);
	const c = computed(() => s.get() * 2);

	assert.strictEqual(c.get(), 2);
	s.set(2);
	assert.strictEqual(c.get(), 4);
});

test('computed should notify effects', () => {
	const s = signal(1);
	const c = computed(() => s.get() * 2);
	let count = 0;
	let value = 0;

	effect(() => {
		value = c.get();
		count++;
	});

	assert.strictEqual(count, 1);
	assert.strictEqual(value, 2);

	s.set(2);
	// s updates -> c updates -> effect updates
	assert.strictEqual(count, 2);
	assert.strictEqual(value, 4);
});

test('effect correctly handles dynamic dependencies', () => {
	const s1 = signal(true);
	const s2 = signal('A');
	const s3 = signal('B');
	let runCount = 0;

	// effect depends on s1, and either s2 or s3
	effect(() => {
		runCount++;
		// If s1 is true, we read s2. If false, we read s3.
		if (s1.get()) {
			s2.get();
		} else {
			s3.get();
		}
	});

	assert.strictEqual(runCount, 1);

	// Change s2, should trigger effect (s1 is true)
	s2.set('A2');
	assert.strictEqual(runCount, 2);

	// Change s3, should NOT trigger effect (s1 is true)
	s3.set('B2');
	assert.strictEqual(runCount, 2);

	// Change s1 to false, should trigger effect
	s1.set(false);
	assert.strictEqual(runCount, 3);

	// Now s1 is false. Depends on s3.
	// Change s2, should NOT trigger effect
	s2.set('A3');
	assert.strictEqual(runCount, 3);

	// Change s3, should trigger effect
	s3.set('B3');
	assert.strictEqual(runCount, 4);
});

test('effect cleanup works', () => {
	const s = signal(1);
	let count = 0;
	const dispose = effect(() => {
		s.get();
		count++;
	});

	assert.strictEqual(count, 1);
	s.set(2);
	assert.strictEqual(count, 2);

	dispose();
	s.set(3);
	assert.strictEqual(count, 2); // Should not update
});
