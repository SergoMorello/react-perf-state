import {
	useRef,
	useState as useOriginalState,
	type ReactNode,
	type Dispatch,
	type SetStateAction
} from "react";
import QueueStateContext from "./QueueStateContext";

export interface QueueStateContainerProps {
	children: ReactNode;
};

export const QueueStateContainer = ({children}: QueueStateContainerProps) => {
	const [, setVersion] = useOriginalState(0);
	const rafQueuesRef = useRef(new Map<Function, ((current: any) => any)[]>());
	const rafIdRef = useRef<number | null>(null);

	const processQueue = () => {
		rafQueuesRef.current.forEach((updates, apply) => {
			const next = updates.reduce<any>((acc, update) => {
				return typeof update === 'function' ? update(acc) : update;
			}, undefined);
			apply((current: any) => (next === undefined ? current : next));
		});
		rafQueuesRef.current.clear();
		rafIdRef.current = null;
		setVersion(v => v + 1);
	};

	function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
	function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
	function useState<S>(initialState?: S | (() => S)) {
		const hasInitial = arguments.length > 0;
		const initialValue = hasInitial
			? (typeof initialState === 'function' ? (initialState as () => S)() : (initialState as S))
			: (undefined as unknown as S | undefined);
		const stateRef = useRef<S | undefined>(initialValue as S | undefined);

		const apply = (computeNext: (prev: S | undefined) => S | undefined) => {
			stateRef.current = computeNext(stateRef.current as S | undefined) as S | undefined;
		};

		const dispatch: Dispatch<SetStateAction<S>> = (update: SetStateAction<S>) => {
			if (!rafQueuesRef.current.has(apply)) {
				rafQueuesRef.current.set(apply, []);
			}
			rafQueuesRef.current.get(apply)!.push((current: S | undefined) => (typeof update === 'function' ? (update as (prev: S) => S)(current as S) : (update as S)));
			if (!rafIdRef.current) {
				rafIdRef.current = requestAnimationFrame(processQueue);
			}
		};

		return [stateRef.current as S, dispatch] as const;
	}

	return(
		<QueueStateContext.Provider value={{useState}}>
			{children}
		</QueueStateContext.Provider>
	);
};