import React from 'react';
import {
  Animated,
  View,
  LayoutRectangle,
  LayoutChangeEvent,
} from 'react-native';
import { Pager, PagerGestureContainer } from './pager';
import { useNavigator } from './hooks';
import { NavigatorScreen } from './screen';

const EMPTY_RECT = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

// TABS ========================================================================
interface ITabs {
  children: React.ReactNode;
  animatedValue?: Animated.Value;
}

function Tabs({ children, animatedValue }: ITabs) {
  const { navigate, activeIndex } = useNavigator();

  const animatedIndex = React.useRef(animatedValue || new Animated.Value(0));
  const numberOfScreens = React.Children.count(children);

  const [layout, setLayout] = React.useState<LayoutRectangle>(EMPTY_RECT);

  function handleLayout(event: LayoutChangeEvent) {
    setLayout(event.nativeEvent.layout);
  }

  function handleGestureChange(nextIndex: number) {
    const routes = React.Children.map(
      children,
      (child: any) => child.props.path as string
    );

    const route = routes[nextIndex];

    if (route) {
      navigate(route);
    }
  }

  return (
    <View style={{ flex: 1, overflow: 'hidden' }} onLayout={handleLayout}>
      <PagerGestureContainer>
        <Pager
          style={{
            flex: 1,
            flexDirection: 'row',
            width: layout.width * numberOfScreens,
          }}
          pageSize={layout.width}
          activeIndex={activeIndex}
          onChange={handleGestureChange}
          animatedIndex={animatedIndex.current}
        >
          {React.Children.map(children, (child: any, index: number) => {
            return <NavigatorScreen index={index}>{child}</NavigatorScreen>;
          })}
        </Pager>
      </PagerGestureContainer>
    </View>
  );
}

export { Tabs };
