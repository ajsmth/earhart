// import {
//   render as rtlRender,
//   queryAllByTestId,
//   NativeTestInstance,
//   getQueriesForElement,
//   RenderOptions,
//   Queries,
// } from '@testing-library/react-native';

// console.log("why?")

// function findFocused(container: NativeTestInstance): NativeTestInstance {
//   let screens = queryAllByTestId(container, /rnl-screen/i);

//   let maxDepth = 0;
//   let matchIndex = 0;

//   // finds rnl-screen with the highest focus depth in the tree
//   for (let i = 0; i < screens.length; i++) {
//     const screen = screens[i];
//     const depth = parseInt(screen.props.testID.replace(/^\D+/g, ''));

//     if (depth >= maxDepth) {
//       matchIndex = i;
//       maxDepth = depth;
//     }
//   }

//   return screens[matchIndex];
// }

// function getFocused(container: NativeTestInstance) {
//   const focusedScreen = findFocused(container);
//   return {
//     container: focusedScreen,
//     ...getQueriesForElement(focusedScreen),
//   };
// }

// type IOptions = Omit<RenderOptions, 'queries'>;

// function render(ui: any, options?: IOptions) {
//   const defaultOptions = {
//     options: {
//       debug: {
//         omitProps: [
//           'style',
//           'activeOpacity',
//           'activeOffsetX',
//           'pointerEvents',
//           'collapsable',
//           'underlineColorAndroid',
//           'rejectResponderTermination',
//           'allowFontScaling',
//           'testID',
//         ],
//       },
//     },
//   };

//   const utils = rtlRender(ui, {...defaultOptions, ...options});

//   const containerQueries: Queries = {};
//   const focusedQueries = {};

//   Object.keys(utils).forEach((key: string) => {
//     // patch all queries by defaulted to search within focused screen
//     if (key.includes('find') || key.includes('query') || key.includes('get')) {
//       // @ts-ignore
//       focusedQueries[key] = args => getFocused(utils.container)[key](args);
//       // @ts-ignore
//       containerQueries[key] = args => utils[key](args);
//     }
//   });

//   function debug(container?: NativeTestInstance) {
//     if (container) {
//       utils.debug(container);
//     } else {
//       const focused = findFocused(utils.container);
//       utils.debug(focused);
//     }
//   }

//   return {
//     ...utils,
//     containerQueries,
//     debug,
//     ...focusedQueries,
//   };
// }

export function hello() {}

// export * from '@testing-library/react-native';
// // export {render, findFocused};
