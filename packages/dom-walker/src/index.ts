import {
  setNamePrefix,
  addAugmentations,
  resetAugmentations,
  coreAugmentations,
  nodeAugmentations,
  listAugmentations,
  create as createRoot,
} from '@actualwave/tree-walker';

import type { Adapter } from '@actualwave/tree-walker';

import BrowserDOMAdapter from './adapter';
import { eventAugmentations, elementAugmentations } from './augmentations';
import { createHandlers } from '@actualwave/tree-walker/property-handlers';

const { descendants: coreDescendants } = nodeAugmentations;

addAugmentations(coreAugmentations);
addAugmentations({
  ...nodeAugmentations,
  descendants: (node: unknown, adapter: Adapter, args: unknown[], utils: unknown) => {
    const [childName] = args as [string?];
    return coreDescendants(
      node,
      adapter,
      childName ? [childName.toLowerCase()] : args,
      utils as never,
    );
  },
});
addAugmentations(listAugmentations);
addAugmentations(eventAugmentations);
addAugmentations(elementAugmentations);

setNamePrefix('$', createHandlers());

const create = (root: unknown, adapter: Adapter = BrowserDOMAdapter): unknown =>
  createRoot(root, adapter);

export { addAugmentations, resetAugmentations, setNamePrefix, create };

export default create;
