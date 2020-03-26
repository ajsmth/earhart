import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '../test-utils';
import { Router, Navigator, Tabs, Route, Link } from '../src';

test('render()', () => {
  const { getFocused, getByText } = render(
    <Router>
      <Navigator>
        <Tabs>
          <Route path="/">
            <Text>1</Text>
          </Route>

          <Route path="/two">
            <Text>2</Text>
          </Route>
        </Tabs>

        <Link to="/two">
          <Text>To two</Text>
        </Link>
      </Navigator>
    </Router>
  );

  getFocused().getByText('1');

  fireEvent.press(getByText(/to two/i));

  getFocused().getByText('2');
});
