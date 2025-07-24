import { StateUpdater, Dispatch } from 'preact/hooks';


export type SetStateFn<T extends unknown> = Dispatch<StateUpdater<T>>;
