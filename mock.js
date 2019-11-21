// UNCOMMENT IF TESTING W/ REACT-NATIVE-REANIMATED OR GESTURE HANDLER:

// jest.mock('react-native-reanimated', () => {
//   const React = require('react');

//   const View = require('react-native/Libraries/Components/View/View');
//   const mock = require('react-native-reanimated/mock');

//   mock.default.Value = function() {
//     return {
//       setValue: function() {},
//     };
//   };

//   function MockView(props) {
//     React.useEffect(() => {
//       props.onLayout &&
//         props.onLayout({
//           nativeEvent: {layout: {width: 100, height: 100}},
//         });
//     }, []);

//     return React.createElement(View, props, props.children);
//   }

//   mock.default.View = MockView;

//   mock.default.useCode = function() {};

//   return mock;
// });

// jest.mock('react-native-gesture-handler', () => {
//   const View = require('react-native/Libraries/Components/View/View');
//   const TouchableOpacity = require('react-native/Libraries/Components/Touchable/TouchableOpacity');
//   const Flatlist = require('react-native/Libraries/Lists/FlatList');
//   return {
//     Swipeable: View,
//     DrawerLayout: View,
//     State: {},
//     ScrollView: View,
//     Slider: View,
//     Switch: View,
//     TextInput: View,
//     ToolbarAndroid: View,
//     ViewPagerAndroid: View,
//     DrawerLayoutAndroid: View,
//     WebView: View,
//     NativeViewGestureHandler: View,
//     TapGestureHandler: View,
//     FlingGestureHandler: View,
//     ForceTouchGestureHandler: View,
//     LongPressGestureHandler: View,
//     PanGestureHandler: View,
//     PinchGestureHandler: View,
//     RotationGestureHandler: View,
//     /* Buttons */
//     RawButton: View,
//     BaseButton: View,
//     RectButton: View,
//     BorderlessButton: View,
//     TouchableOpacity: TouchableOpacity,
//     /* Other */
//     FlatList: Flatlist,
//     gestureHandlerRootHOC: jest.fn(),
//     Directions: {},
//   };
// });
