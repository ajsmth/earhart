import React from 'react';
import { BackHandler, Linking, Alert, InteractionManager } from 'react-native';

import { HistoryContext, NavigatorContext, IndexContext } from './library';

function useHistory() {
  return React.useContext(HistoryContext);
}

function useNavigator() {
  return React.useContext(NavigatorContext);
}

function useParams<T>() {
  return React.useContext(NavigatorContext).params as Partial<T>;
}

function Prompt({ message = '', when = false }) {
  usePrompt({ message, when });
  return null;
}

const HardwareBackPressEventType = 'hardwareBackPress';

/**
 *
 */
function useHardwareBackButton() {
  let history = useHistory();
  let { navigate } = useNavigator();

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
  let history = useHistory();

  // Get the initial URL
  let firstRender = React.useRef(true);
  if (firstRender.current) {
    firstRender.current = false;
    Linking.getInitialURL().then(url => {
      if (url) history.push(trimScheme(url));
    });
  }

  // Listen for URL changes
  React.useEffect(() => {
    function handleURLChange(event: { url: string }) {
      history.push(trimScheme(event.url));
    }

    Linking.addEventListener(URLEventType, handleURLChange);

    return () => {
      Linking.removeEventListener(URLEventType, handleURLChange);
    };
  }, [history]);
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
  let history = useHistory();

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
            // tx.retry();
          },
        };

        blocker(autoUnblockingTx);
      });

      return unblock;
    }
  }, [history, when, blocker]);
}

function useFocus() {
  const index = React.useContext(IndexContext);
  const { activeIndex } = useNavigator();
  return activeIndex === index;
}

// ref: https://github.com/react-navigation/hooks/issues/62#issuecomment-593531670
function useFocusLazy() {
  const isFocused = useFocus();
  const [isFocusedLazy, setIsFocusedLazy] = React.useState(false);

  React.useEffect(() => {
    const { cancel } = InteractionManager.runAfterInteractions(() => {
      setIsFocusedLazy(isFocused);
    });

    return cancel;
  }, [isFocused]);

  return isFocusedLazy;
}

export {
  useBlocker,
  useDeepLinking,
  useHardwareBackButton as useAndroidBackButton,
  usePrompt,
  Prompt,
  useFocus,
  useFocusLazy,
  useParams,
  useNavigator,
  useHistory,
};
