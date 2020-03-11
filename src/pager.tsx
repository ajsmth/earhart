import React from 'react';
import { Animated, ViewStyle } from 'react-native';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerProperties,
} from 'react-native-gesture-handler';

interface IPagerGestureContainer {
  children: React.ReactNode;
  panProps?: Partial<PanGestureHandlerProperties>;
}

function PagerGestureContainer({ children, panProps }: IPagerGestureContainer) {
  const translationY = React.useRef(new Animated.Value(0));
  const translationX = React.useRef(new Animated.Value(0));
  const gestureState = React.useRef(new Animated.Value(0));

  const handleGesture = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translationX.current,
          translationY: translationY.current,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const handleStateChange = Animated.event(
    [
      {
        nativeEvent: {
          state: gestureState.current,
        },
      },
    ],
    { useNativeDriver: true }
  );

  return (
    <PanGestureContext.Provider
      value={{
        translationX: translationX.current,
        translationY: translationY.current,
        gestureState: gestureState.current,
      }}
    >
      <PanGestureHandler
        {...panProps}
        onGestureEvent={handleGesture}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View style={{ flex: 1 }}>{children}</Animated.View>
      </PanGestureHandler>
    </PanGestureContext.Provider>
  );
}

const PanGestureContext = React.createContext({
  translationX: new Animated.Value(0),
  translationY: new Animated.Value(0),
  gestureState: new Animated.Value(0),
});

interface IPager {
  children: React.ReactNode;
  style?: ViewStyle;
  activeIndex: number;
  animatedIndex: Animated.Value;
  onChange: (nextIndex: number) => void;
  pageSize: number;
  onEnd?: (activeIndex: number) => void;
  clampDrag?: {
    prev: number;
    next: number;
  };
  snapThreshold?: number;
  orientation?: 'horizontal' | 'vertical';
}

function Pager({
  children,
  style = {},
  activeIndex,
  animatedIndex,
  onChange,
  pageSize,
  onEnd,
  clampDrag = {
    prev: 4,
    next: 4,
  },
  snapThreshold = 0.3,
  orientation = 'horizontal',
}: IPager) {
  const { translationX, translationY, gestureState } = React.useContext(
    PanGestureContext
  );

  const targetTranslation =
    orientation === 'horizontal' ? translationX : translationY;

  const numberOfScreens = React.Children.count(children);
  const minIndex = 0;
  const maxIndex = numberOfScreens - 1;

  const dragStartValue = React.useRef(0);
  const swiping = React.useRef(false);
  const dragPercentage = React.useRef(0);
  const nextIndex = React.useRef(activeIndex);

  // spring to index changes from active index prop
  React.useEffect(() => {
    if (activeIndex !== nextIndex.current) {
      nextIndex.current = activeIndex;
      dragStartValue.current = activeIndex;

      Animated.spring(animatedIndex, {
        toValue: activeIndex,
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        useNativeDriver: true,
      }).start(() => {
        onEnd && onEnd(activeIndex);
      });
    }
  }, [activeIndex, nextIndex, dragStartValue, animatedIndex]);

  const currentAnimatedValue = React.useRef(0);

  // track value of animated index for use in other listeners
  const trackAnimatedIndex = React.useCallback(({ value }) => {
    currentAnimatedValue.current = value;
  }, []);

  useAnimatedListener(animatedIndex, trackAnimatedIndex);

  const convertTranslationToAnimatedIndex = React.useCallback(
    ({ value }) => {
      // pageSize might be 0
      const _pageSize = pageSize === 0 ? 1 : pageSize;
      dragPercentage.current = (value / _pageSize) * -1;
      const dragValue = dragPercentage.current + dragStartValue.current;

      const minValue = activeIndex - clampDrag.prev;
      const maxValue = activeIndex + clampDrag.next;

      const clampedDragValue = Math.min(
        Math.max(dragValue, minValue),
        maxValue
      );

      animatedIndex.setValue(clampedDragValue);
    },
    [pageSize, clampDrag, activeIndex, animatedIndex]
  );

  // convert translation value into an animated index value
  useAnimatedListener(targetTranslation, convertTranslationToAnimatedIndex);

  // track start and end of gestures to determine the drag values
  // snap to a given index (if necessary) on release
  const handleGestureStateChanges = React.useCallback(
    ({ value }) => {
      if (value === State.ACTIVE) {
        if (!swiping.current) {
          swiping.current = true;
          dragStartValue.current = currentAnimatedValue.current;
        }
      }

      if (value === State.END) {
        swiping.current = false;

        let indexChange = 0;
        if (dragPercentage.current > snapThreshold) {
          indexChange = 1;
        }

        if (dragPercentage.current < -snapThreshold) {
          indexChange = -1;
        }

        let next = activeIndex + indexChange;

        next = Math.min(Math.max(next, minIndex), maxIndex);

        if (next !== activeIndex) {
          onChange(next);
        }

        dragStartValue.current = next;
        nextIndex.current = next;
        // reset drag - android holds onto this value and triggers navigation
        dragPercentage.current = 0;

        Animated.spring(animatedIndex, {
          toValue: next,
          stiffness: 1000,
          damping: 500,
          mass: 3,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
          useNativeDriver: true,
        }).start(() => {
          onEnd && onEnd(next);
        });
      }
    },
    [activeIndex, onEnd, animatedIndex]
  );

  useAnimatedListener(gestureState, handleGestureStateChanges);

  const targetTrasformProperty =
    orientation === 'horizontal' ? 'translateX' : 'translateY';

  // apply transformation based on animated index value
  // this value reflects how many page sizes to be offset
  const transformStyle = React.useMemo(() => {
    return {
      transform: [
        {
          [targetTrasformProperty]: Animated.multiply(animatedIndex, -pageSize),
        },
      ],
    };
  }, [pageSize, animatedIndex]);

  return (
    <Animated.View style={{ flex: 1, ...style, ...transformStyle }}>
      {children}
    </Animated.View>
  );
}

// safely listen to animated values changing via callback
function useAnimatedListener(
  value: Animated.Value,
  cb: Animated.ValueListenerCallback
) {
  React.useEffect(() => {
    const listener = value.addListener(cb);
    return () => {
      value.removeListener(listener);
    };
  }, [value, cb]);
}

export { PagerGestureContainer, Pager };
