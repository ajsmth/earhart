import React from 'react';
import App from '../App';

import {render} from '../../../src/test-utils';

test('render()', () => {
  const {debug} = render(<App />);
  debug();
});
