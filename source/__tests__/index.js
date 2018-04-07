import SomeString from '../index';

describe('index', () => {
  it('should export string as default', () => {
    expect(typeof SomeString).toEqual('string');
  });

  it('should export non-empty string', () => {
    expect(SomeString).toBeTruthy();
  });
});
