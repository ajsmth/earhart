import React from 'react';
import {
  MemoryHistory,
  Location,
  createMemoryHistory,
  Unlistener,
} from 'history';
import { IRoute, IMatch, IRouteProps } from './types';
import {
  ViewStyle,
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
} from 'react-native';
import {
  joinPaths,
  compilePath,
  computeScore,
  createParams,
  generatePath,
  resolveLocation,
} from './util';

// ROUTER ========================================================================

interface ILocationContext {
  location: Location;
  history: MemoryHistory;
  pending: boolean;
}

const LocationContext = React.createContext<ILocationContext | undefined>(
  undefined
);

interface IMemoryRouter {
  children: React.ReactNode;
  initialEntries?: string[];
  initialIndex?: number;
  timeout?: number;
}

function MemoryRouter({
  children,
  initialEntries,
  initialIndex,
  timeout,
}: IMemoryRouter) {
  let historyRef = React.useRef<MemoryHistory | null>(null);

  if (historyRef.current == null) {
    historyRef.current = createMemoryHistory({ initialEntries, initialIndex });
  }

  return (
    <Router
      children={children}
      history={historyRef.current}
      timeout={timeout}
    />
  );
}

const startTransition = (tx: Function) => tx();
// @ts-ignore
const useTransition = React.useTransition || (() => [startTransition, false]);

interface IRouter {
  children: React.ReactNode;
  history: MemoryHistory;
  timeout?: number;
}

function Router({ children, history, timeout }: IRouter) {
  let [location, setLocation] = React.useState(history.location);
  let [startTransition, pending] = useTransition({ timeoutMs: timeout });

  React.useEffect(() => {
    const unlisten = history.listen(({ location }: { location: Location }) => {
      startTransition(() => {
        setLocation(location);
      });
    });

    return () => {
      unlisten();
    };
  });

  return (
    <LocationContext.Provider
      children={children}
      value={{ history, location, pending: pending }}
    />
  );
}

function useRouter() {
  const context = React.useContext(LocationContext);

  if (context === undefined) {
    throw new Error('useRouter() must be used within a <NativeRouter />');
  }

  return context;
}

// NAVIGATOR ========================================================================

type ISetMatchContext = (match: IMatch) => void;

const SetMatchContext = React.createContext<ISetMatchContext>(() => {});

const RoutesContainerContext = React.createContext<any>(View);

type NavigateFn = (path: string | number, options?: NavigateOptions) => void;

interface INavigatorContext {
  navigate: NavigateFn;
  params: any;
  match?: IMatch;
  animatedIndex: Animated.Value;
}
const NavigatorContext = React.createContext<INavigatorContext>({
  navigate: () => {},
  params: {},
  match: undefined,
  animatedIndex: new Animated.Value(0),
});

const IndexContext = React.createContext(-1);

const RouteContext = React.createContext<IRoute>({
  path: '/',
  index: -1,
  children: null,
});

interface INavigator {
  children: React.ReactNode;
}

function Navigator({ children }: INavigator) {
  const [match, setMatch] = React.useState<IMatch | undefined>(undefined);
  const animatedIndex = React.useRef(new Animated.Value(0));
  const route = React.useContext(RouteContext);

  const params = {
    ...match?.params,
  };

  React.useEffect(() => {
    if (match?.route?.redirectTo) {
      let relativeTo = resolveLocation(match.route.redirectTo, route.path);

      let { pathname } = relativeTo;
      if (/:\w+/.test(pathname)) {
        // Allow param interpolation into <Redirect to>, e.g.
        // <Redirect from="users/:id" to="profile/:id">
        relativeTo = {
          ...relativeTo,
          pathname: generatePath(pathname, params),
        };
      }

      navigate(relativeTo.pathname, { replace: true });
    }
  }, [match]);

  const navigate = useNavigate(route.path, params);

  return (
    <NavigatorContext.Provider
      value={{ navigate, params, match, animatedIndex: animatedIndex.current }}
    >
      <SetMatchContext.Provider value={setMatch}>
        {children}
      </SetMatchContext.Provider>
    </NavigatorContext.Provider>
  );
}

interface NavigateOptions {
  replace?: boolean;
  state?: Object;
}

function useNavigate(path: string = '/', params = {}): NavigateFn {
  const { history, pending } = useRouter();

  function navigate(to: string | number, options: NavigateOptions = {}) {
    if (typeof to === 'number') {
      history.go(to);
    } else {
      const { replace, state } = options;

      // remove nested wildcards in route path
      path = path.replace('/*', '');
      // inject params into pathname
      const pathname = generatePath(path, params);
      let relativeTo = resolveLocation(to, pathname);

      // If we are pending transition, use REPLACE instead of PUSH.
      // This will prevent URLs that we started navigating to but
      // never fully loaded from appearing in the history stack.
      let method = !!replace || pending ? 'replace' : 'push';
      // @ts-ignore
      history[method](relativeTo, state);
    }
  }

  return navigate;
}

function useNavigator() {
  return React.useContext(NavigatorContext);
}

function useParams() {
  return React.useContext(NavigatorContext).params;
}

// ROUTES ========================================================================

interface IRoutes {
  children: React.ReactNode;
  style?: ViewStyle;
}

function Routes({ children, style }: IRoutes) {
  const route = useRoute();
  const setMatch = React.useContext(SetMatchContext);
  const { location } = useRouter();
  const Container = React.useContext(RoutesContainerContext);

  const routes = createRoutesFromChildren(children, route.path);

  React.useEffect(() => {
    const match = findBestMatchingRoute(routes, location.pathname);
    if (match) {
      setMatch(match);
    }
  }, [location.pathname, routes]);

  return (
    <Container routes={routes} style={style}>
      {React.Children.map(children, (child: any, index: number) => {
        const route = routes[index];

        return (
          <RouteContext.Provider value={route}>
            <IndexContext.Provider value={index}>
              <NavigatorScreen>{child}</NavigatorScreen>
            </IndexContext.Provider>
          </RouteContext.Provider>
        );
      })}
    </Container>
  );
}

function useRoute() {
  return React.useContext(RouteContext);
}

function createRoutesFromChildren(children: React.ReactNode, basename = '/') {
  const routes: IRoute[] = [];

  React.Children.forEach(children, (child: any, index: number) => {
    let props = child.props as IRouteProps;
    basename = basename.replace('*', '');

    const route: IRoute = {
      index: index,
      path: joinPaths([basename, props.path]),
      children: props.children || null,
    };

    if (props.to) {
      route.redirectTo = props.to;
    }

    routes.push(route);
  });

  return routes;
}

function findBestMatchingRoute(routes: IRoute[], location: string) {
  let index = 0;
  let matches: IMatch[] = [];

  location = location.slice(1);

  while (index < routes.length) {
    const route = routes[index];

    let [matcher, keys] = compilePath(route.path, true, false);
    // @ts-ignore
    if (matcher.test(location)) {
      // @ts-ignore
      let match = location.match(matcher);
      let score = computeScore(route.path);

      matches.push({
        index,
        pathname: '/' + match[1],
        route,
        score,
        params: createParams(keys as string[], match?.slice(2)),
      });
    }

    index++;
  }

  const rankedMatches = matches.sort((a, b) => b.score - a.score);
  const topMatch = rankedMatches[0];

  return topMatch;
}

// LINK ========================================================================

interface ILink extends TouchableOpacityProps {
  to: string;
  style?: any;
  as?: any;
  replace?: boolean;
  state?: Object;
  children: React.ReactNode;
}

function Link({
  as: Component = TouchableOpacity,
  onPress,
  style,
  replace = false,
  state,
  children,
  to,
  ...rest
}: ILink) {
  let { navigate } = React.useContext(NavigatorContext);

  return (
    <Component
      {...rest}
      style={style}
      onPress={(event: any) => {
        if (onPress) onPress(event);
        navigate(to, { replace, state });
      }}
    >
      {children}
    </Component>
  );
}

function Route({ children }: IRouteProps) {
  return children || null;
}

function Redirect({}: { to: string }) {
  return null;
}

interface INavigatorScreen {
  children: React.ReactNode;
}

// @ts-ignore
const isTestEnvironment = process.env.NODE_ENV === 'test';

function NavigatorScreen(props: any) {
  if (isTestEnvironment) {
    return <FocusScreenTESTONLY {...props} />;
  }

  return <View style={{ flex: 1 }} {...props} />;
}

// used to determine the focus of the application via test-utils
function FocusScreenTESTONLY({ children, ...rest }: INavigatorScreen) {
  const route = useRoute();
  const { match } = useNavigator();
  const focused = match && match.index === route.index; // direct parent screen is focused
  const parentUnfocused = React.useContext(UnfocusedContext); // in an unfocused / disabled screen

  const focusDepth = React.useContext(FocusDepthContext);
  let depth = focusDepth;

  // one or all of the parents is unfocused
  if (parentUnfocused || !focused) {
    depth = 0;
  }

  return (
    <View
      style={{ flex: 1 }}
      accessibilityStates={[focused ? 'selected' : 'disabled']}
      testID={`rnl-screen-${depth}`}
      {...rest}
    >
      <FocusDepthProvider depth={depth + 1} focused={focused}>
        {children}
      </FocusDepthProvider>
    </View>
  );
}

const FocusDepthContext = React.createContext(1);
const UnfocusedContext = React.createContext(false);

function FocusDepthProvider({ children, depth, focused }: any) {
  const unfocused = !focused;

  return (
    <FocusDepthContext.Provider value={depth}>
      <UnfocusedProvider unfocused={unfocused}>{children}</UnfocusedProvider>
    </FocusDepthContext.Provider>
  );
}

function UnfocusedProvider({ children, unfocused }: any) {
  const parentUnfocused = React.useContext(UnfocusedContext);

  return (
    <UnfocusedContext.Provider
      value={parentUnfocused ? parentUnfocused : unfocused}
    >
      {children}
    </UnfocusedContext.Provider>
  );
}

export {
  MemoryRouter as NativeRouter,
  Routes,
  Route,
  Redirect,
  Link,
  Navigator,
  RoutesContainerContext,
  IndexContext,
  useRoute,
  useNavigator,
  useNavigate,
  useRouter,
  useParams,
};
