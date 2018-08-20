/* eslint-disable global-require */
describe('Augmentations', () => {
  let resetAugmentations;
  let addAugmentations;
  let hasAugmentation;
  let getAugmentation;
  let applyAugmentation;

  beforeEach(() => {
    jest.resetModules();

    ({
      resetAugmentations,
      addAugmentations,
      hasAugmentation,
      getAugmentation,
      applyAugmentation,
    } = require('../index'));
  });

  const AUG1_NAME = 'augment1';
  const AUG1_HANDLER = (...args) => `AUG1: ${args.join(', ')}`;

  const AUG2_NAME = 'augment2';
  const AUG2_HANDLER = (...args) => `AUG2: ${args.join(', ')}`;

  it('should not have augmentation at beginning', () => {
    expect(hasAugmentation(AUG1_NAME)).toBe(false);
    expect(hasAugmentation(AUG2_NAME)).toBe(false);
  });

  describe('When register augmentations', () => {
    beforeEach(() => {
      addAugmentations({
        [AUG1_NAME]: AUG1_HANDLER,
        [AUG2_NAME]: AUG2_HANDLER,
      });
    });

    it('should have added augmentations', () => {
      expect(hasAugmentation(AUG1_NAME)).toBe(true);
      expect(getAugmentation(AUG1_NAME)).toBe(AUG1_HANDLER);
      expect(hasAugmentation(AUG2_NAME)).toBe(true);
      expect(getAugmentation(AUG2_NAME)).toBe(AUG2_HANDLER);
    });

    describe('When augmenation applied', () => {
      it('should be called with all arguments', () => {
        expect(applyAugmentation(AUG1_NAME, 1, 2, 'three')).toBe(
          'AUG1: 1, 2, three',
        );
      });
    });

    describe('When augmentations reset', () => {
      beforeEach(() => {
        resetAugmentations();
      });

      it('should not have augmentation', () => {
        expect(hasAugmentation(AUG1_NAME)).toBe(false);
        expect(getAugmentation(AUG1_NAME)).toBe(undefined);
        expect(hasAugmentation(AUG2_NAME)).toBe(false);
        expect(getAugmentation(AUG2_NAME)).toBe(undefined);
      });
    });

    describe('When augmentations replace', () => {
      beforeEach(() => {
        resetAugmentations({
          [AUG1_NAME]: AUG2_HANDLER,
        });
      });

      it('should have augmentations replaced', () => {
        expect(hasAugmentation(AUG1_NAME)).toBe(true);
        expect(getAugmentation(AUG1_NAME)).toBe(AUG2_HANDLER);
        expect(hasAugmentation(AUG2_NAME)).toBe(false);
        expect(getAugmentation(AUG2_NAME)).toBe(undefined);
      });
    });
  });
});
