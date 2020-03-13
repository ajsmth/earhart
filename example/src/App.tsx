/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import {
  NativeRouter,
  Tabs,
  Routes,
  Route,
  Link,
  Redirect,
  useRouter,
  Stack,
} from '../../src/index';

function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <NativeRouter>
        <Stack>
          <Routes>
            <Route path="home">
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>Home</Text>
              </View>
            </Route>

            <Route path="settings">
              <View style={{flex: 1, backgroundColor: 'red'}}>
                <Text>Settings</Text>
              </View>
            </Route>

            <Redirect to="home" />
          </Routes>

          <Link to="home">
            <Text>To Home</Text>
          </Link>
          <Link to="settings">
            <Text>To Settings</Text>
          </Link>
        </Stack>

        <Location />
      </NativeRouter>
    </SafeAreaView>
  );
}

function Location() {
  const {location} = useRouter();
  return <Text>{location.pathname}</Text>;
}
export default App;
