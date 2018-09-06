/* eslint-disable global-require, no-prototype-builtins */
import { create } from '../index';
import { setNamePrefix, isValidPrefix } from '../prefixes';
import { ONodeAdapter, getSourceTree } from '../../fixtures';

const DATA_PREFIX = '$';

const dataPrefixGetHandler = (target, adapter, [name]) => {
  const node = adapter.toNode(target);
  return node.data ? node.data[name] : undefined;
};

const dataPrefixHasHandler = (target, adapter, [name]) => {
  const node = adapter.toNode(target);
  return node.data ? node.data.hasOwnProperty(name) : false;
};

const dataPrefixSetHandler = (target, adapter, [name, value]) => {
  const node = adapter.toNode(target);
  if (!node.data) {
    node.data = {};
  }

  node.data[name] = value;
  return true;
};

const dataPrefixDeleteHandler = (target, adapter, [name]) => {
  const node = adapter.toNode(target);
  return node.data ? delete node.data[name] : false;
};

describe('Using data prefixes', () => {
  let source;
  let root;

  const runSharedTestCases = () => {
    describe('GET', () => {
      describe('When get from node', () => {
        it('should return data property value', () => {
          expect(root.$level).toBe(0);
          expect(root.first.$level).toBe(1);
          expect(root.first.first.third.$index).toBe(0);
          expect(root.first.first.uniqueName.$uniqueParam).toBe('123-456');
        });
      });

      describe('When get from list', () => {
        it('should return data property value', () => {
          expect(root.first.first.third[0].$index).toBe(0);
          expect(root.first.first.third[2].$index).toBe(2);
        });
      });
    });

    describe('HAS', () => {
      describe('When get from node', () => {
        it('should return TRUE for existing data properties', () => {
          expect('$level' in root).toBe(true);
          expect('$otherLevel' in root).toBe(false);
          expect('$index' in root.first.first.third).toBe(true);
          expect('$uniqueParam' in root.first.first.uniqueName).toBe(true);
          expect('$otherParam' in root.first.first.uniqueName).toBe(false);
        });
      });

      describe('When get from list', () => {
        it('should return TRUE for existing data properties', () => {
          expect('$index' in root.first.first.third[0]).toBe(true);
          expect('$noIndex' in root.first.first.third[0]).toBe(false);
        });
      });
    });
  };

  describe('When set with function', () => {
    beforeEach(() => {
      setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
      source = getSourceTree();

      root = create(source, ONodeAdapter);
    });

    runSharedTestCases();

    describe('SET', () => {
      it('should throw an error', () => {
        expect(() => {
          root.$level = 2;
        }).toThrowError();

        expect(() => {
          root.first.first.uniqueName.$otherParam = 'value';
        }).toThrowError();
      });
    });

    describe('DELETE PROPERTY', () => {
      it('should throw an error', () => {
        expect(() => {
          delete root.$level;
        }).toThrowError();

        expect(() => {
          delete root.first.first.uniqueName.$uniqueParam;
        }).toThrowError();
      });
    });
  });

  describe('When set with object', () => {
    beforeEach(() => {
      setNamePrefix(DATA_PREFIX, {
        get: dataPrefixGetHandler,
        has: dataPrefixHasHandler,
        set: dataPrefixSetHandler,
        deleteProperty: dataPrefixDeleteHandler,
      });
      source = getSourceTree();

      root = create(source, ONodeAdapter);
    });

    runSharedTestCases();

    describe('SET', () => {
      it('should throw an error', () => {
        root.$level = 2;
        expect(root.$level).toBe(2);

        root.first.first.third[2].$index = 500;
        expect(root.first.first.third[2].$index).toBe(500);

        root.first.first.uniqueName.$otherParam = 'my new value';
        expect(root.first.first.uniqueName.$otherParam).toBe('my new value');
      });
    });

    describe('DELETE PROPERTY', () => {
      it('should throw an error', () => {
        expect(delete root.$level).toBe(true);
        expect(delete root.$otherLevel).toBe(true);

        expect('$uniqueParam' in root.first.first.uniqueName).toBe(true);
        expect(delete root.first.first.uniqueName.$uniqueParam).toBe(true);
        expect('$uniqueParam' in root.first.first.uniqueName).toBe(false);
      });
    });
  });
});

describe('isValidPrefix()', () => {
  describe('When prefix not registered', () => {
    let _isValidPrefix;
    let _setNamePrefix;

    beforeEach(() => {
      jest.resetModules();
      ({ isValidPrefix: _isValidPrefix, setNamePrefix: _setNamePrefix } = require('../prefixes'));
    });

    it('should result with FALSE', () => {
      expect(_isValidPrefix(DATA_PREFIX)).toBe(false);
    });

    describe('When prefix registered', () => {
      beforeEach(() => {
        _setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
      });

      it('should result with TRUE', () => {
        expect(_isValidPrefix(DATA_PREFIX)).toBe(true);
      });
    });
  });

  it('should result with FALSE for non registered prefix', () => {
    expect(isValidPrefix('a')).toBe(false);
    expect(isValidPrefix('@')).toBe(false);
    expect(isValidPrefix(' ')).toBe(false);

    expect(isValidPrefix(true)).toBe(false);
    expect(isValidPrefix(2)).toBe(false);
    expect(isValidPrefix('abc')).toBe(false);
  });
});

describe('getPrefixGetHandler()', () => {
  let _getPrefixGetHandler;
  let _setNamePrefix;

  beforeEach(() => {
    jest.resetModules();
    ({
      getPrefixGetHandler: _getPrefixGetHandler,
      setNamePrefix: _setNamePrefix,
    } = require('../prefixes'));
  });

  describe('When prefix not registered', () => {
    it('should result with NULL', () => {
      expect(_getPrefixGetHandler(DATA_PREFIX)).toBeUndefined();
    });
  });

  describe('When prefix registered', () => {
    beforeEach(() => {
      _setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
    });

    it('should result with fhandler function', () => {
      expect(_getPrefixGetHandler(DATA_PREFIX)).toBe(dataPrefixGetHandler);
    });
  });
});
