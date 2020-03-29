import React from 'react';
import { createMemoryHistory, MemoryHistory } from 'history';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ViewStyle, View } from 'react-native';
import { ScreenProps, StackPresentationTypes } from 'react-native-screens';

interface IRouter {
  children: React.ReactNode;
  initialEntries?: string[];
  initialIndex?: number;
}

export interface INavigateOptions {
  replace?: boolean;
  latest?: boolean;
}

const HistoryContext = React.createContext<MemoryHistory>(
  createMemoryHistory()
);

function Router({ children, initialEntries, initialIndex }: IRouter) {
  const history = React.useRef(
    createMemoryHistory({ initialEntries, initialIndex })
  );

  return (
    <HistoryContext.Provider value={history.current}>
      {children}
    </HistoryContext.Provider>
  );
}

const RegisterRouteContext = React.createContext((route: string) => {});

const NavigatorContext = React.createContext<INavigatorState>({
  activeIndex: 0,
  params: {},
  navigate: () => {},
});

export interface INavigatorState {
  activeIndex: number;
  params: any;
  navigate: (to: string | number, options?: INavigateOptions) => void;
}

interface INavigator {
  children: React.ReactNode;
  style?: ViewStyle;
  initialIndex?: number;
}

function Navigator({ children, style, initialIndex = 0 }: INavigator) {
  const { params: parentParams } = React.useContext(NavigatorContext);

  const history = React.useContext(HistoryContext);

  const [activeIndex, setActiveIndex] = React.useState(initialIndex);
  const [params, setParams] = React.useState(parentParams);

  const update = React.useCallback((location: string) => {
    const routes = subscriptions.current;
    const match = findMatch(routes, location);

    if (match.activeIndex > -1) {
      setActiveIndex(match.activeIndex);
      setParams(p => {
        return {
          ...p,
          ...match.params,
        };
      });
    }
  }, []);

  const subscriptions = React.useRef<string[]>([]);

  const register = React.useCallback(
    (route: string) => {
      subscriptions.current.push(route);
      update(history.location.pathname);

      return () => {
        subscriptions.current = subscriptions.current.filter(r => r !== route);
      };
    },
    [history, update]
  );

  React.useEffect(() => {
    const unsub = history.listen(location => {
      update(location.pathname);
    });

    return unsub;
  }, []);

  const navigate = React.useCallback(
    (to: string | number, options?: INavigateOptions) => {
      options = options || {};

      if (typeof to === 'number') {
        history.go(to);
        return;
      }

      if (to.includes(':')) {
        to = generatePath(to, params);
      }

      if (options.latest) {
        const entries = history.entries;
        for (let i = entries.length - 1; i > 0; i--) {
          const entry = entries[i];

          if (entry && entry.pathname.includes(to)) {
            // already pushed this view - revert to original specified valu
            if (i === entries.length - 1) {
              history.push(to);
              return;
            }

            history.push(entry);
            return;
          }
        }
      }

      if (options.replace) {
        history.replace(to);
        return;
      }

      history.push(to);
    },
    [history, params]
  );

  const context: INavigatorState = { activeIndex, params, navigate };

  return (
    <NavigatorContext.Provider value={context}>
      <RegisterRouteContext.Provider value={register}>
        <View style={{ flex: 1, ...style }}>
          {typeof children === 'function' ? children(context) : children}
        </View>
      </RegisterRouteContext.Provider>
    </NavigatorContext.Provider>
  );
}

// basic find match algo
function findMatch(routes: string[], location: string) {
  const ranks: number[] = [];
  const params: Object[] = [];
  let matchingIndex = -1;
  let topRank = 0;

  const locationSegments = location.split('/').slice(1);

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    const routeSegments = route.split('/').slice(1);

    let rank = 0;
    let _params = {};

    if (routeSegments.length > locationSegments.length) {
      ranks.push(rank);
      break;
    }

    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const locationSegment = locationSegments[i];

      if (routeSegment === locationSegment) {
        rank += 3;
        continue;
      }

      if (routeSegment.startsWith(':')) {
        rank += 2;

        const key = routeSegment.replace(':', '');
        // @ts-ignore
        _params[key] = locationSegment;

        continue;
      }

      if (routeSegment.includes('*')) {
        rank += 1;
        continue;
      }

      // definite no match - break early
      rank += -3;
      break;
    }

    if (rank > topRank) {
      matchingIndex = index;
      topRank = rank;
    }

    ranks.push(rank);
    params.push(_params);
  }

  return {
    activeIndex: matchingIndex,
    params: params[matchingIndex],
    rank: ranks[matchingIndex],
  };
}

/**
 * Creates a path with params interpolated.
 */
export function generatePath(pathname: string, params: any = {}) {
  return pathname
    .replace(/:(\w+)/g, (_, key) => params[key] || `:${key}`)
    .replace(/\*$/, splat => params[splat] || splat);
}

interface IRoute extends Omit<ScreenProps, 'stackPresentation'> {
  children: any;
  path: string;
  stackPresentation?: StackPresentationTypes;
  header?: any;
}

function Route({ children, path }: IRoute) {
  const register = React.useContext(RegisterRouteContext);

  React.useEffect(() => {
    const unsub = register(path);
    return unsub;
  }, [path]);

  return children;
}

interface ILink {
  to: string | number;
  options?: INavigateOptions;
  children: React.ReactNode;
  style?: ViewStyle;
}

function Link({ to, children, options, style }: ILink) {
  const { navigate } = React.useContext(NavigatorContext);

  const _navigate = React.useCallback(() => {
    navigate(to, options);
  }, [navigate, to, options]);

  return (
    <TouchableOpacity containerStyle={style} onPress={_navigate}>
      {children}
    </TouchableOpacity>
  );
}

const IndexContext = React.createContext(-1);

export {
  Router,
  Navigator,
  Route,
  Link,
  NavigatorContext,
  HistoryContext,
  IndexContext,
};
