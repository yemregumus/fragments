const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
} = require('../../src/model/data/memory/index.js');

describe('memory/index calls', () => {
  const data = { ownerId: 'owner', id: '1', fragment: 'Fragment 1' };

  // writeFragment
  test('writeFragment', async () => {
    await writeFragment(data);
  });

  //readFragment
  test('readFragment', async () => {
    expect(await readFragment(data.ownerId, data.id)).toEqual({
      ownerId: 'owner',
      id: '1',
      fragment: 'Fragment 1',
    });
  });

  // writeFragmentData
  test('writeFragmentData', async () => {
    await writeFragmentData(data.ownerId, data.id, 'Fragment 1 data');
  });

  // readFragmentData
  test('readFragmentData', async () => {
    expect(await readFragmentData(data.ownerId, data.id)).toEqual('Fragment 1 data');
  });
});
