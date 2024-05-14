import { describe, expect, it } from 'vitest';

import { mergeBoundsArr } from './utils';

describe('utils', () => {
  it('should mergeBoundsArr', () => {
    expect(mergeBoundsArr([])).toEqual([]);
    expect(
      mergeBoundsArr([
        { top: 10, bottom: 20, left: 10, right: 20 },
        { top: 11, bottom: 19, left: 11, right: 19 },
      ]),
    ).toEqual([{ top: 10, bottom: 20, left: 10, right: 20 }]);
    expect(
      mergeBoundsArr([
        { top: 116, right: 767.5, bottom: 186, left: 687.5 },
        { top: 100, right: 879.5, bottom: 202, left: 671.5 },
        { top: 100, right: 879.5, bottom: 202, left: 671.5 },
        { top: 116, right: 863.5, bottom: 186, left: 783.5 },
      ]),
    ).toEqual([{ top: 100, right: 879.5, bottom: 202, left: 671.5 }]);
  });
});
