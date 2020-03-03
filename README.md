# earhart

Earhart is a fork of react-router (v6) tailored to the needs of React Native applications

## How is it different?

1. Native applications often need to hold onto more implicit state than web ones, so this library tends to hold onto views instead of unmounting them. For example, navigating between tabs doesn't reset scroll position or unmount any components unless you want it to.

2. Gestures can be a pain to implement with a router, so these are handled for the most part, and location changes that happen as a result of gestures are captured by the router.

3. The API is slightly different - most native navigation libraries provide primitive components like Tabs, Stack, and Switch, and the same goes for this library. Routes are grouped by these components, and the end result is something like this:

```javascript
import { Navigation, Tabs, Routes, Route, Link, Redirect } from 'earhart';

function MyNavigation() {
  return (
    <Navigation>
      <Tabs>
        <Routes>
          <Route path="home/*">
            <Home />
          </Route>

          <Route path="settings/*">
            <Settings />
          </Route>

          <Redirect to="/home" />
        </Routes>

        <Link to="home">
          <Text>To home</Text>
        </Link>

        <Link to="settings">
          <Text>To settings</Text>
        </Link>
      </Tabs>
    </Navigation>
  );
}
```

## How is it the same?

The majority of the routing logic and components are mostly unmodified from react-router. This means most of the good stuff from react-router is still at your disposal.

## Installation

```bash
yarn add earhart react-native-gesture-handler
cd ios && pod install
```

Android has additional steps to setup the gesture handler: https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html#android
