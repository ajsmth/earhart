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

import {enableScreens, ScreenStackHeaderConfig} from 'react-native-screens';

enableScreens();

import {
  Router,
  Route,
  Link,
  Stack,
  Switch,
  Tabs,
  Navigator,
  useHistory,
  Header,
} from '../../src/index';

function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <Text>Home</Text>
    </View>
  );
}

function Settings() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <Text>Settings</Text>
    </View>
  );
}

function Profile() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <Text>Profile</Text>
    </View>
  );
}

function MyStack() {
  return (
    <Navigator>
      {({params}: any) => {
        return (
          <>
            <Stack>
              <Route path="/home">
                <Header title="Home" largeTitle backgroundColor="transparent" />
                <Home />
              </Route>

              <Route path="/settings">
                <Header
                  title="Settings"
                  largeTitle
                  backgroundColor="transparent"
                />
                <Settings />
              </Route>

              <Route path="/profile/:id">
                <Header
                  title={`Profile: ${params.id}`}
                  largeTitle
                  backgroundColor="transparent"
                />

                <Profile />
              </Route>
            </Stack>

            <View style={{flexDirection: 'row'}}>
              <Link to="/home">
                <View style={{height: 50, padding: 5, borderWidth: 1}}>
                  <Text>To Home</Text>
                </View>
              </Link>
              <Link to="/settings">
                <View style={{height: 50, padding: 5, borderWidth: 1}}>
                  <Text>To Settings</Text>
                </View>
              </Link>

              <Link to="/profile/123">
                <View style={{height: 50, padding: 5, borderWidth: 1}}>
                  <Text>To Profile</Text>
                </View>
              </Link>
            </View>
          </>
        );
      }}
    </Navigator>
  );
}

function App() {
  return (
    <Router initialEntries={['/home']}>
      <MyStack />
      <Location />
    </Router>
  );
}

function useLocation() {
  const history = useHistory();
  const [location, setLocation] = React.useState(history.location.pathname);

  React.useEffect(() => {
    return history.listen(location => {
      setLocation(location.pathname);
    });
  }, [history]);

  return location;
}

function Location() {
  const location = useLocation();
  return <Text>{location}</Text>;
}
export default App;
