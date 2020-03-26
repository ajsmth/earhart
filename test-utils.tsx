import {
  render as rtlRender,
  queryAllByTestId,
  NativeTestInstance,
  getQueriesForElement,
  RenderOptions,
  Queries,
} from '@testing-library/react-native';

function findFocused(container: NativeTestInstance): NativeTestInstance {
  let screens = queryAllByTestId(container, /earhart-screen/i);

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

type IOptions = Omit<RenderOptions, 'queries'>;

function render(ui: any, options?: IOptions) {
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

  function getFocused(container: NativeTestInstance) {
    const focusedScreen = findFocused(container);
    return {
      container: focusedScreen,
      debug: () => utils.debug(focusedScreen),
      ...getQueriesForElement(focusedScreen),
    };
  }

  const utils = rtlRender(ui, { ...defaultOptions, ...options });

  return {
    ...utils,
    getFocused: (container?: NativeTestInstance) =>
      getFocused(container || utils.container),
  };
}

export * from '@testing-library/react-native';
export { render, findFocused };
