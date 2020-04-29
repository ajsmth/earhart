import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  ScreenStack,
  Screen,
  ScreenStackHeaderConfigProps,
  ScreenStackHeaderConfig,
  // @ts-ignore
  ScreenStackHeaderCenterView,
  ScreenStackHeaderLeftView,
  ScreenStackHeaderRightView,
} from 'react-native-screens';
import { useNavigator } from './hooks';
import { NavigatorScreen } from './screen';

interface IStack {
  children: React.ReactNode;
}

function Stack({ children }: IStack) {
  const { activeIndex, navigate } = useNavigator();

  function handleBack() {
    const routes = React.Children.map(
      children,
      (child: any) => child.props.path
    );

    const nextRoute = routes[activeIndex - 1];

    if (nextRoute) {
      navigate(nextRoute);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenStack style={StyleSheet.absoluteFill}>
        {React.Children.map(children, (child: any, index) => {
          if (index > activeIndex) {
            return null;
          }

          return (
            <Screen
              stackPresentation="push"
              onDismissed={handleBack}
              style={StyleSheet.absoluteFill}
              pointerEvents={index === activeIndex ? 'auto' : 'none'}
              {...child.props}
            >
              {child.props.header ? child.props.header : null}

              <View style={StyleSheet.absoluteFill}>
                <NavigatorScreen index={index}>
                  {child.props.children}
                </NavigatorScreen>
              </View>
            </Screen>
          );
        })}
      </ScreenStack>

      {/* Register the route components independent of what is rendered above  */}
      {React.Children.map(children, (child: any) => {
        return React.cloneElement(child, {
          children: null,
        });
      })}
    </View>
  );
}

function Header(props: ScreenStackHeaderConfigProps) {
  return <ScreenStackHeaderConfig {...props} />;
}

Header.Left = ScreenStackHeaderLeftView;
Header.Right = ScreenStackHeaderRightView;
Header.Center = ScreenStackHeaderCenterView;

export { Stack, Header };
