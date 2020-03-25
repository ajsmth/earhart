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

function MyStack({children}) {
  return (
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
          {children || (
            <View style={{flex: 1, backgroundColor: 'red'}}>
              <Text>Settings</Text>
            </View>
          )}
        </Route>

        <Redirect to="home" />
      </Routes>
      <View style={{flexDirection: 'row'}}>
        <Link to="home">
          <View style={{height: 50, padding: 5, borderWidth: 1}}>
            <Text>To Home</Text>
          </View>
        </Link>
        <Link to="settings">
          <View style={{height: 50, padding: 5, borderWidth: 1}}>
            <Text>To Settings</Text>
          </View>
        </Link>
      </View>
    </Stack>
  );
}

function NestedStacks() {
  return (
    <MyStack>
      <MyStack>
        <MyStack>
          <MyStack>
            <MyStack>
              <MyStack>
                <MyStack>
                  <MyStack>
                    <MyStack>
                      <MyStack>
                        <MyStack>
                          <MyStack />
                        </MyStack>
                      </MyStack>
                    </MyStack>
                  </MyStack>
                </MyStack>
              </MyStack>
            </MyStack>
          </MyStack>
        </MyStack>
      </MyStack>
    </MyStack>
  );
}

function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <NativeRouter>
        <NestedStacks />
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
