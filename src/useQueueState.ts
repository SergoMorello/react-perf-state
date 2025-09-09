import {
	useRef,
	useState as useOriginalState,
	useEffect,
	useContext
} from 'react';
import QueueStateContext from './QueueStateContext';

const rafStateQueue = new Map<React.Dispatch<React.SetStateAction<any>>, ((current: any) => any)[]>(); // Очередь состояний для всех экземпляров
let rafId: number | null = null;

function processStateQueue() {
	rafStateQueue.forEach((updates, setState) => {
		const nextState = updates.reduce<any>((acc, update) => {
			return typeof update === 'function' ? update(acc) : update;
		}, undefined);
		setState(nextState);
	});

	rafStateQueue.clear();
	rafId = null;
}

export const useQueueState = <T>(initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const ctx = useContext(QueueStateContext);
	const [state, setState] = ctx === undefined ? useOriginalState<T>(initialValue) : ctx.useState<T>(initialValue);
	const stateRef = useRef<T>(state);

	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	const queuedSetState = (update: React.SetStateAction<T>) => {
		if (!rafStateQueue.has(setState)) {
			rafStateQueue.set(setState, []);
		}

		rafStateQueue.get(setState)?.push((current) => {
			if (current === undefined) {
				current = stateRef.current;
			}
			return typeof update === 'function' ? (update as (prevState: T) => T)(current) : update;
		});

		if (!rafId) {
			rafId = requestAnimationFrame(processStateQueue);
		}
	};

	return [state, queuedSetState];
}