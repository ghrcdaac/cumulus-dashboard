'use strict';

import test from 'ava';
import cloneDeep from 'lodash.clonedeep';
import reducer, { initialState } from '../../app/src/js/reducers/providers';
import { UPDATE_PROVIDER } from '../../app/src/js/actions/types';

test('UPDATE_PROVIDER reducer', (t) => {
  const inputState = cloneDeep(initialState);
  const expected = cloneDeep(initialState);

  expected.map = { someProviderName: { data: 'some important data' } };
  expected.updated = { someProviderName: { status: 'success' } };

  const action = {
    type: UPDATE_PROVIDER,
    data: 'some important data',
    id: 'someProviderName'
  };
  const actual = reducer(inputState, action);
  t.deepEqual(expected, actual);
});
