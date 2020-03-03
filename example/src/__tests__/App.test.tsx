import React from 'react';
import App from '../App';

import {render} from '@testing-library/react-native';
import {Navigation} from 'earhart';

console.log({Navigation});

test('render()', () => {
  const {debug} = render(<App />);
  debug();
});
