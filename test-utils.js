import {
  render as rtlRender,
  queryAllByTestId,
  getQueriesForElement,
} from '@testing-library/react-native';

function findFocused(container) {
  let screens = queryAllByTestId(container, /rnl-screen/i);

  let maxDepth = 0;
  let matchIndex = 0;

  // finds rnl-screen with the highest focus depth in the tree
  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    const depth = parseInt(screen.props.testID.replace(/^\D+/g, ''));

    if (depth >= maxDepth) {
      matchIndex = i;
      maxDepth = depth;
    }
  }

  return screens[matchIndex];
}

function getFocused(container) {
  const focusedScreen = findFocused(container);
  return {
    container: focusedScreen,
    ...getQueriesForElement(focusedScreen),
  };
}

function render(ui, options) {
  const defaultOptions = {
    options: {
      debug: {
        omitProps: [
          'style',
          'activeOpacity',
          'activeOffsetX',
          'pointerEvents',
          'collapsable',
          'underlineColorAndroid',
          'rejectResponderTermination',
          'allowFontScaling',
          'testID',
        ],
      },
    },
  };

  const utils = rtlRender(ui, { ...defaultOptions, ...options });

  const containerQueries = {};
  const focusedQueries = {};

  Object.keys(utils).forEach(key => {
    // patch all queries by defaulted to search within focused screen
    if (key.includes('find') || key.includes('query') || key.includes('get')) {
      focusedQueries[key] = args => getFocused(utils.container)[key](args);
      containerQueries[key] = args => utils[key](args);
    }
  });

  function debug(container) {
    if (container) {
      utils.debug(container);
    } else {
      const focused = findFocused(utils.container);
      utils.debug(focused);
    }
  }

  return {
    ...utils,
    containerQueries,
    debug,
    ...focusedQueries,
  };
}

export * from '@testing-library/react-native';
export { render, findFocused };
