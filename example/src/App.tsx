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

import {NativeRouter, Tabs, Routes, Route, Link, Redirect} from 'earhart';

function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <NativeRouter>
        <Tabs>
          <Routes>
            <Route path="home">
              <View>
                <Text>Home</Text>
              </View>
            </Route>

            <Route path="settings">
              <View>
                <Text>Settings</Text>
              </View>
            </Route>

            <Redirect to="/home" />
          </Routes>

          <Link to="home">
            <Text>To Home</Text>
          </Link>
          <Link to="settings">
            <Text>To Settings</Text>
          </Link>
        </Tabs>
      </NativeRouter>
    </SafeAreaView>
  );
}

export default App;
