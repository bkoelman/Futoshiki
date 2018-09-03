import { EnumNamesToArrayPipe } from './enum-names-to-array.pipe';

describe('EnumNamesToArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new EnumNamesToArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
