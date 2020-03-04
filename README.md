# earhart

earhart is a fork of react-router (v6) tailored to the needs of React Native applications

## How is it different?

1. Native applications often need to hold onto more implicit state than web ones, so this library tends to keep views alive instead of unmounting them. For example, navigating between tabs doesn't reset scroll position or unmount any components unless you want it to.

2. Gestures can be a pain to implement with a router, so these are handled for the most part, and location changes that happen as a result of gestures are captured by the router.

3. The API is slightly different - most native navigation libraries provide primitive components like Tabs, Stack, and Switch, and the same goes for this library. Your routes are grouped by these components, and the end result looks something like this:

```javascript
import { NativeRouter, Tabs, Routes, Route, Link, Redirect } from 'earhart';

function App() {
  return (
    <NativeRouter>
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
    </NativeRouter>
  );
}
```

4. react-router (v6) uses an `element` prop for route components whereas this library uses plain children.

## How is it the same?

The majority of the routing logic, hooks, and components are pretty much unmodified from react-router

## Installation

```bash
yarn add earhart react-native-gesture-handler
```

The gesture handler has additional installation steps that are outlined here:
https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html#installation

## Concepts

earhart is built around the idea of navigators, which are components that manage a set of routes. Each navigator differs in how it presents its routes and how a user can interact with them. A tabs navigator allows users to swipe between adjacent routes, a stack navigator stacks routes on top of eachother, and a switch navigator renders one route at a time.

They are all the same in that only one route is focused at a time, and they share the same general API:

```javascript
function MyNavigator() {
  // this could be stack, or switch ,or tabs:
  return (
    <Stack>
      <MyHeader />

      <Routes>
        <Route path="/" />
        <Route path="hello" />
        <Route path="joe" />
      </Routes>

      <MyFooter />
    </Stack>
  );
}
```

In order to provide a composable API, there are some magical rules that you should be aware of:

1. All routes need to be declared as a direct child of a `<Routes />` component
2. The presentational behaviour of these routes is determined by the nearest parent navigator component (e.g the Stack component in the example above).

Aside from those two things, you have the freedom to render and compose components as you see fit.

## Navigating around

react-router (v6) introduced a new `navigate()` function along with the concept of relative pathing. Accessing the navigate function in your components is achievable with hooks:

```javascript
function MyForm() {
  const navigator = useNavigator()

  function onSubmit() {
    submit(form).then(() => navigator.navigate('../success'))
  }

  return ...
}
```

## Future plans and addons

### Navigators

- native stack
- native switch
- shared element transitions

### Utilities

- testing utility library
- async storage library
- development tooling - navigation bar
