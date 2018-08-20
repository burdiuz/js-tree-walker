/* eslint-disable global-require */
import { create } from '../index';
import { setNamePrefix, isValidPrefix } from '../prefixes';
import { ONodeAdapter, getSourceTree } from '../../fixtures';

const DATA_PREFIX = '$';

const dataPrefixGetHandler = (target, adapter, [name]) => {
  const node = adapter.toNode(target);
  return node.data ? node.data[name] : undefined;
};

describe('Using data prefixes', () => {
  let source;
  let root;

  beforeEach(() => {
    setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
    source = getSourceTree();

    root = create(source, ONodeAdapter);
  });

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

  describe('APPLY', () => {
    // FIXME create augmentation that accepts additional arguments
  });
});

describe('isValidPrefix()', () => {
  describe('When prefix not registered', () => {
    let _isValidPrefix;
    let _setNamePrefix;

    beforeEach(() => {
      jest.resetModules();
      ({
        isValidPrefix: _isValidPrefix,
        setNamePrefix: _setNamePrefix,
      } = require('../prefixes'));
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

describe('getPrefixHandler()', () => {
  let _getPrefixHandler;
  let _setNamePrefix;

  beforeEach(() => {
    jest.resetModules();
    ({
      getPrefixHandler: _getPrefixHandler,
      setNamePrefix: _setNamePrefix,
    } = require('../prefixes'));
  });

  describe('When prefix not registered', () => {
    it('should result with NULL', () => {
      expect(_getPrefixHandler(DATA_PREFIX)).toBeUndefined();
    });
  });

  describe('When prefix registered', () => {
    beforeEach(() => {
      _setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
    });

    it('should result with fhandler function', () => {
      expect(_getPrefixHandler(DATA_PREFIX)).toBe(dataPrefixGetHandler);
    });
  });
});
