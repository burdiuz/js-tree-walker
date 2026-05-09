import type { Adapter, PrefixHandlers } from '../types';

type DataRecord = Record<string, unknown>;
type GetData = (node: unknown) => DataRecord | undefined;

const getHandler = (data: DataRecord | undefined, [name]: unknown[]): unknown =>
  data ? data[name as string] : undefined;

const hasHandler = (data: DataRecord | undefined, [name]: unknown[]): boolean =>
  !!data && Object.hasOwn(data, name as string);

const setHandler = (data: DataRecord | undefined, [name, value]: unknown[]): boolean => {
  if (!data) {
    return false;
  }
  data[name as string] = value;
  return true;
};

const deletePropertyHandler = (
  data: DataRecord | undefined,
  [name]: unknown[],
): boolean => (data ? delete data[name as string] : false);

const defaultDataGetter = (node: unknown): DataRecord | undefined =>
  node as DataRecord | undefined;

const preHandler =
  (getData: GetData, handler: (data: DataRecord | undefined, args: unknown[]) => unknown) =>
  (target: unknown, adapter: Adapter, args: unknown[]): unknown =>
    handler(getData(adapter.toNode(target)), args);

export const createROHandlers = (getData: GetData = defaultDataGetter): PrefixHandlers => ({
  get: preHandler(getData, getHandler),
  has: preHandler(getData, hasHandler),
});

export const createHandlers = (getData: GetData = defaultDataGetter): PrefixHandlers => ({
  ...createROHandlers(getData),
  set: preHandler(getData, setHandler),
  deleteProperty: preHandler(getData, deletePropertyHandler),
});
