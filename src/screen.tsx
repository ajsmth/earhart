import React from 'react';
import { IndexContext } from './library';
import { View } from 'react-native';
import { useNavigator, useFocus } from './hooks';

// @ts-ignore
const isTestEnvironment = process.env.NODE_ENV === 'test';

interface INavigatorScreen {
  children: React.ReactNode;
  index: number;
}

function NavigatorScreen({ index, children }: INavigatorScreen) {
  if (isTestEnvironment) {
    return (
      <IndexContext.Provider value={index}>
        <FocusScreenTESTONLY index={index}>{children}</FocusScreenTESTONLY>
      </IndexContext.Provider>
    );
  }

  return (
    <IndexContext.Provider value={index}>{children}</IndexContext.Provider>
  );
}
// used to determine the focus of the application via test-utils
function FocusScreenTESTONLY({ children, index }: INavigatorScreen) {
  const { activeIndex } = useNavigator();
  const focused = activeIndex === index; // direct parent screen is focused
  const parentUnfocused = React.useContext(UnfocusedContext); // in an unfocused / disabled screen

  const focusDepth = React.useContext(FocusDepthContext);
  let depth = focusDepth;

  // one or all of the parents is unfocused
  if (parentUnfocused || !focused) {
    depth = 0;
  }

  return (
    <View testID={`earhart-screen-${depth}`}>
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

export { NavigatorScreen };
