/* eslint-disable global-require */
describe('Default Adapter', () => {
  let setDefaultAdapter;
  let getDefaultAdapter;

  beforeEach(() => {
    jest.resetModules();

    ({ setDefaultAdapter, getDefaultAdapter } = require('../default-adapter'));
  });

  const ADAPTER = { type: 'default-adapter' };

  it('should not have default adapter at beginnig', () => {
    expect(getDefaultAdapter()).toBe(undefined);
  });

  describe('When set default adapter', () => {
    beforeEach(() => {
      setDefaultAdapter(ADAPTER);
    });

    it('should have default adapter', () => {
      expect(getDefaultAdapter()).toBe(ADAPTER);
    });
  });
});
