import React from 'react';
import {
  Animated,
  View,
  LayoutRectangle,
  LayoutChangeEvent,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { Pager, PagerGestureContainer } from './pager';
import {
  Navigator,
  RoutesContainerContext,
  useNavigator,
  IndexContext,
} from './router';
import { IRoute } from './types';

const EMPTY_RECT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

// TABS ========================================================================
interface ITabs {
  children: React.ReactNode;
}

function Tabs({ children }: ITabs) {
  return (
    <Navigator>
      <RoutesContainerContext.Provider value={TabsScreenContainer}>
        {children}
      </RoutesContainerContext.Provider>
    </Navigator>
  );
}

interface IRoutesContainer {
  children: React.ReactNode;
  routes: IRoute[];
  style?: ViewStyle;
}

function TabsScreenContainer({ children, routes, style }: IRoutesContainer) {
  const { navigate, match, animatedIndex } = useNavigator();
  const numberOfScreens = React.Children.count(children);

  const [layout, setLayout] = React.useState<LayoutRectangle>(EMPTY_RECT);

  function handleLayout(event: LayoutChangeEvent) {
    setLayout(event.nativeEvent.layout);
  }

  function handleGestureChange(nextIndex: number) {
    const route = routes[nextIndex];

    if (route) {
      navigate(route.path);
    }
  }

  return (
    <View
      style={{ flex: 1, overflow: 'hidden', ...style }}
      onLayout={handleLayout}
    >
      <PagerGestureContainer>
        <Pager
          style={{
            flex: 1,
            flexDirection: 'row',
            width: layout.width * numberOfScreens,
          }}
          pageSize={layout.width}
          activeIndex={match ? match.index : -1}
          onChange={handleGestureChange}
          animatedIndex={animatedIndex}
        >
          {children}
        </Pager>
      </PagerGestureContainer>
    </View>
  );
}

// SWITCH ========================================================================

interface ISwitch {
  children: React.ReactNode;
  keepAlive?: boolean;
}

function Switch({ children, keepAlive }: ISwitch) {
  return (
    <Navigator>
      <RoutesContainerContext.Provider
        value={
          keepAlive ? KeepAliveSwitchScreenContainer : SwitchScreenContainer
        }
      >
        {children}
      </RoutesContainerContext.Provider>
    </Navigator>
  );
}

function SwitchScreenContainer({ children, style }: IRoutesContainer) {
  const { match, animatedIndex } = useNavigator();
  const activeIndex = match ? match.index : -1;

  React.useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: activeIndex,
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, animatedIndex]);

  return (
    <View style={{ flex: 1, ...style }}>
      {React.Children.map(children, (child, index) => {
        if (index !== activeIndex) {
          return null;
        }

        return child;
      })}
    </View>
  );
}

function KeepAliveSwitchScreenContainer({ children, style }: IRoutesContainer) {
  const { match, animatedIndex } = useNavigator();
  const activeIndex = match ? match.index : -1;

  React.useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: activeIndex,
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, animatedIndex]);

  return (
    <View style={{ flex: 1, ...style }}>
      {React.Children.map(children, (child, index) => {
        return (
          <View
            style={{
              display: activeIndex === index ? 'flex' : 'none',
              ...StyleSheet.absoluteFillObject,
            }}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
}

// STACK ========================================================================
interface IStack {
  children: React.ReactNode;
}

function Stack({ children }: IStack) {
  return (
    <Navigator>
      <RoutesContainerContext.Provider value={StackScreenContainer}>
        {children}
      </RoutesContainerContext.Provider>
    </Navigator>
  );
}

function StackScreenContainer({ children, routes, style }: IRoutesContainer) {
  const { match, animatedIndex, navigate } = useNavigator();
  const activeIndex = match ? match.index : 0;

  const numberOfScreens = React.Children.count(children);

  const previousIndex = usePrevious(activeIndex);
  const [popIndex, setPopIndex] = React.useState(activeIndex);

  const lastIndex = React.Children.count(children) - 1;

  // if nested in another pan, delegate pan events to parent container on the last screen
  const activeOffsetX = activeIndex === lastIndex ? [-10, 10] : [-5, 5];

  React.useEffect(() => {
    // if a view should be pushed onto the stack, increase the pop index
    // when a value is popped of the stack, after the animation completes the popIndex is set
    if (previousIndex < activeIndex) {
      setPopIndex(activeIndex);
    }
  }, [activeIndex, previousIndex]);

  const [layout, setLayout] = React.useState<LayoutRectangle>(EMPTY_RECT);

  function handleLayout(event: LayoutChangeEvent) {
    setLayout(event.nativeEvent.layout);
  }

  function handleGestureChange(nextIndex: number) {
    const route = routes[nextIndex];

    if (route) {
      navigate(route.path);
    }
  }

  return (
    <View style={{ flex: 1, ...style }} onLayout={handleLayout}>
      <PagerGestureContainer
        panProps={{ enabled: activeIndex !== 0, activeOffsetX }}
      >
        <Pager
          style={{
            flex: 1,
            flexDirection: 'row',
            width: layout.width * numberOfScreens,
          }}
          pageSize={layout.width}
          activeIndex={activeIndex}
          onChange={handleGestureChange}
          animatedIndex={animatedIndex}
          onEnd={(index: number) => setPopIndex(index)}
        >
          {React.Children.map(children, (child: any, index: number) => {
            return (
              <StackScreen
                index={index}
                animatedIndex={animatedIndex}
                pageSize={layout.width}
              >
                {index <= popIndex ? child : null}
              </StackScreen>
            );
          })}
        </Pager>
      </PagerGestureContainer>
    </View>
  );
}

function StackScreen({ children, index, animatedIndex, pageSize }: any) {
  const offset = Animated.subtract(index, animatedIndex);

  const clampedValue = offset.interpolate({
    inputRange: [-1, 0],
    outputRange: [0.6, 0],
    extrapolateRight: 'clamp',
  });

  const clampedStyles = {
    transform: [{ translateX: Animated.multiply(clampedValue, pageSize) }],
  };

  return (
    <Animated.View style={{ flex: 1, ...clampedStyles }}>
      {children}
    </Animated.View>
  );
}

interface ITabbar {
  children: React.ReactNode;
  style?: ViewStyle;
}

function Tabbar({ children, style }: ITabbar) {
  return (
    <View style={{ flexDirection: 'row', ...style }}>
      {React.Children.map(children, (child: any, index: number) => {
        return (
          <IndexContext.Provider value={index}>{child}</IndexContext.Provider>
        );
      })}
    </View>
  );
}

function usePrevious(value: any) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef<any>();

  // Store current value in ref
  React.useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export { Tabs, Switch, Stack, Tabbar };
