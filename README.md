# earhart

earhart is a router for React Native applications

## How is it different from other routing libraries?

1. Native applications often need to hold onto more implicit state than web ones, so this library tends to keep views alive instead of unmounting them. For example, navigating between tabs doesn't reset scroll position or unmount any components unless you want it to.

2. Gestures can be a pain to implement with a router, so these are handled for the most part, and location changes that happen as a result of gestures are captured by the router.

3. The API is slightly different - most native navigation libraries provide primitive components like Tabs, Stack, and Switch, and the same goes for this library. Your routes are grouped by these components, and the end result looks something like this:

```javascript
import { Router, Tabs, Route, Link, Navigator } from 'earhart';

function App() {
  return (
    <Router>
      <Navigator>
        <Tabs>
          <Route path="/home">
            <Home />
          </Route>

          <Route path="/settings">
            <Settings />
          </Route>
        </Tabs>

        <Link to="/home">
          <Text>To home</Text>
        </Link>

        <Link to="/settings">
          <Text>To settings</Text>
        </Link>
      </Navigator>
    </Router>
  );
}
```

4. Reduced number of rerenders, as they are more costly in React Native than in the DOM - this is something that is hard to do with react-router currently.

## How is it the same?

The hooks and components are very similar in functionality to react-router and react-navigation.

## Installation

```bash
yarn add earhart react-native-gesture-handler react-native-screens
```

The gesture handler has additional installation steps that are outlined here:
https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html#installation

`react-native-screens` also requires consumers to use the exported `enableScreens()` in the index file of their app

## Concepts

earhart is built around the idea of navigators, which are components that manage a set of routes. Each navigator differs in how it presents its routes and how a user can interact with them. A tabs navigator allows users to swipe between adjacent routes, a stack navigator stacks routes on top of eachother, and a switch navigator renders one route at a time.

They are all the same in that only one route is focused in them at a time, and they share the same general API:

```javascript
function MyNavigator() {
  // this could be stack, or switch ,or tabs:
  return (
    <Navigator>
      <MyHeader />

      <Stack>
        <Route path="/" />
        <Route path="/hello" />
        <Route path="/hello/joe" />
      </Stack>

      <MyFooter />
    </Navigator>
  );
}
```

In order to provide a composable API, there is some necessary markup that you should be aware of. All routes need to be declared as a direct child of a the screen container component (Tabs / Stack / Switch) and need a `path` prop.

This library only supports absolute paths for the time being.

## Navigating around

Accessing the navigate function in your components is achievable with hooks:

```javascript
function MyForm() {
  const navigator = useNavigator()

  function onSubmit() {
    submit(form).then(() => navigator.navigate('/my-form/success'), { replace: true })
  }

  return ...
}
```

## Components

### Router

This is the top level provider component, rendered once at the root of your app. It takes `initialEntries` and `initialIndex` - the same props as `react-router` to setup the initial location for your app.

### Navigator

The navigator wraps around a set of sibling screens that are somehow related. Takes an `initialIndex` prop to specify the default view that will be rendered on mount. The screens themselves are rendered by one of the screen containers (Tabs, Stack, Switch). Only one screen is ever in focus.

### Tabs, Stack, Switch

The three screen containers provided by this library, these will bring into focus the active screen based on the current location of the app. Under the hood, Switch and Stack are native components provided by react-native-screens.

### Route

Routes will render their children when the app location best matches the declared path prop for a given navigator.
The way in which it will become active (e.g transition in/out) depends on the parent screen container (Tabs, Stack, Switch). Route takes additional props when a member of Stack which correspond to the screen props found in `react-native-screens`.

### Header

The Header component applies to screens that are rendered in a Stack - the props available are the same as those defined by `react-native-screens` header config. Header should be a direct child of a Route component. You can also use `Header.Left`, `Header.Right`, and `Header.Center` to define custom children inside of your headers.

### Link

Link will set the current location of the app when a user presses it.

The `to` prop declares what the new location will be set to.

The optional `options` prop lets you configure how the history will be updated:

- `options.replace` will replace the current location with the one declared on the Link.
- `options.latest` will find the most recent matching path to the path declared on the Link and push that view - this is useful for preserving the navigation state of nested routes when linking from more distant parts of the app.

## Hooks

- `useParams()`
- `useNavigator()`
- `useHistory()`
- `useFocus()`
- `useFocusLazy()`

## Creating your own API

One of the nice things about having composition is that you can abstract navigators into their own components. As an example, if we wanted our own stack navigator:

```js
// example usage we might want:
function Signup() {
  return (
    <MyStackNavigator>
      <Welcome path="/signup" title="Welcome!" />
      <UserInfo path="/signup/user" title="Signup" />
      <Success path="/signup/success" title="Congrats!" />
    </MyStackNavigator>
  );
}

function MyStackNavigator({ children }) {
  return (
    <Navigator>
      <Stack>
        {React.Children.map(children, child => {
          return (
            <Route path={child.props.path}>
              <Header title={child.props.title} />
              {child}
            </Route>
          );
        })}
      </Stack>
    </Navigator>
  );
}
```

## Future plans and addons

### Navigators

- shared element transitions - WIP

### Utilities

- testing utility library
- async storage library
- development tooling - navigation bar
