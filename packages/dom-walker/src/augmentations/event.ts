import type { Adapter } from '@actualwave/tree-walker';

const on = (node: unknown, adapter: Adapter, [eventType, callback]: unknown[]): (() => void) => {
  const target = adapter.toNode(node) as EventTarget;
  target.addEventListener(eventType as string, callback as EventListener);
  return () => target.removeEventListener(eventType as string, callback as EventListener);
};

const off = (node: unknown, adapter: Adapter, [eventType, callback]: unknown[]): void => {
  (adapter.toNode(node) as EventTarget).removeEventListener(
    eventType as string,
    callback as EventListener,
  );
};

const emit = (node: unknown, adapter: Adapter, [event]: unknown[]): void => {
  (adapter.toNode(node) as EventTarget).dispatchEvent(
    event instanceof Event ? event : new Event(String(event)),
  );
};

export default { on, off, emit };
