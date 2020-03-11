import React from 'react';
import {
  BackHandler,
  Linking,
  Alert,
  Animated,
  ViewStyle,
  InteractionManager,
} from 'react-native';
import {
  useRouter,
  useRoute,
  useNavigate,
  useNavigator,
  IndexContext,
} from './router';

function Prompt({ message = '', when = false }) {
  usePrompt({ message, when });
  return null;
}

const HardwareBackPressEventType = 'hardwareBackPress';

/**
 *
 */
function useHardwareBackButton() {
  let { history } = useRouter();
  let navigate = useNavigate();

  React.useEffect(() => {
    function handleHardwardBackPress() {
      if (history.index === 0) {
        // do nothing, we're already on the home screen
        return false;
      } else {
        navigate(-1);
        return true;
      }
    }

    BackHandler.addEventListener(
      HardwareBackPressEventType,
      handleHardwardBackPress
    );

    return () => {
      BackHandler.removeEventListener(
        HardwareBackPressEventType,
        handleHardwardBackPress
      );
    };
  }, [history.index, navigate]);
}

const URLEventType = 'url';

function useDeepLinking() {
  let navigate = useNavigate();

  // Get the initial URL
  let firstRender = React.useRef(true);
  if (firstRender.current) {
    firstRender.current = false;
    Linking.getInitialURL().then(url => {
      if (url) navigate(trimScheme(url));
    });
  }

  // Listen for URL changes
  React.useEffect(() => {
    function handleURLChange(event: { url: string }) {
      navigate(trimScheme(event.url));
    }

    Linking.addEventListener(URLEventType, handleURLChange);

    return () => {
      Linking.removeEventListener(URLEventType, handleURLChange);
    };
  }, [navigate]);
}

function trimScheme(url: string) {
  return url.replace(/^.*?:\/\//, '');
}

/**
 * Prompts the user with an Alert before they leave the current screen.
 */
function usePrompt({ message = '', when = true }) {
  let blocker = React.useCallback(
    tx => {
      Alert.alert('Confirm', message, [
        { text: 'Cancel', onPress() {} },
        {
          text: 'OK',
          onPress() {
            tx.retry();
          },
        },
      ]);
    },
    [message]
  );

  useBlocker(blocker, when);
}

function useBlocker(blocker: Function, when = true) {
  let { history } = useRouter();

  React.useEffect(() => {
    if (when) {
      let unblock = history.block(tx => {
        let autoUnblockingTx = {
          ...tx,
          retry() {
            // Automatically unblock the transition so it can
            // play all the way through before retrying it.
            // TODO: Figure out how to re-enable this block if the
            // transition is cancelled for some reason.
            unblock();
            tx.retry();
          },
        };

        blocker(autoUnblockingTx);
      });

      return unblock;
    }
  }, [history, when, blocker]);
}

function useAnimatedOffset(index: number) {
  const { animatedIndex } = useNavigator();

  const offset = React.useMemo(() => Animated.subtract(index, animatedIndex), [
    index,
    animatedIndex,
  ]);

  return offset;
}

function useInterpolation(interpolation: any, index?: number) {
  const routeIndex = React.useContext(IndexContext);
  index = index !== undefined ? index : routeIndex;

  const offset = useAnimatedOffset(index);

  const styles = React.useMemo(() => {
    return interpolateWithConfig(offset, interpolation);
  }, [interpolation, offset]);

  return styles;
}

function useFocus() {
  const index = React.useContext(IndexContext);
  const { match } = useNavigator();

  return match ? match.index === index : false;
}

// ref: https://github.com/react-navigation/hooks/issues/62#issuecomment-593531670
function useFocusLazy() {
  const isFocused = useFocus();
  const [isFocusedLazy, setIsFocusedLazy] = React.useState(false);

  React.useEffect(() => {
    const { cancel } = InteractionManager.runAfterInteractions(() => {
      setIsFocusedLazy(isFocused);
    });

    return () => cancel();
  }, [isFocused]);

  return isFocusedLazy;
}

export {
  useBlocker,
  useDeepLinking,
  useHardwareBackButton as useAndroidBackButton,
  usePrompt,
  useInterpolation,
  Prompt,
  useFocus,
  useFocusLazy,
};

function interpolateWithConfig(
  offset: Animated.AnimatedSubtraction,
  pageInterpolation?: any
): ViewStyle {
  if (!pageInterpolation) {
    return {};
  }

  return Object.keys(pageInterpolation).reduce((styles: any, key: any) => {
    const currentStyle = pageInterpolation[key];

    if (Array.isArray(currentStyle)) {
      const _style = currentStyle.map((interpolationConfig: any) =>
        interpolateWithConfig(offset, interpolationConfig)
      );

      styles[key] = _style;
      return styles;
    }

    if (typeof currentStyle === 'object') {
      styles[key] = offset.interpolate(currentStyle);
      return styles;
    }

    return styles;
  }, {});
}
