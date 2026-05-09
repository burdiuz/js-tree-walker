import type { PrefixHandlers } from '../types';
type DataRecord = Record<string, unknown>;
type GetData = (node: unknown) => DataRecord | undefined;
export declare const createROHandlers: (getData?: GetData) => PrefixHandlers;
export declare const createHandlers: (getData?: GetData) => PrefixHandlers;
export {};
