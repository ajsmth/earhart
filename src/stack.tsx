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

// RNS doens't allow rendering non-<Screen /> children
// styles aren't really applied to <Screen /> so we can't render it with nothing
// we get around this by rendering routes without their children below
// routes are properly registered and everything works fine
// bit of a hack but it has no noticeable impact

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

          let header = null;
          let _children: any[] = [];

          // extract header from route children
          // android will render <HeaderConfig /> even if its nested so it needs to be removed
          if (Array.isArray(child.props.children)) {
            for (let i = 0; i < child.props.children.length; i++) {
              const _child = child.props.children[i];
              if (_child.type.earhartHeader) {
                header = _child;
              } else {
                _children.push(_child);
              }
            }
          } else {
            _children = child.props.children;
          }

          return (
            <Screen
              stackPresentation="push"
              onDismissed={handleBack}
              style={StyleSheet.absoluteFill}
              pointerEvents={index === activeIndex ? 'auto' : 'none'}
              {...child.props}
            >
              {header}
              <View style={StyleSheet.absoluteFill}>
                <NavigatorScreen index={index}>{_children}</NavigatorScreen>
              </View>
            </Screen>
          );
        })}
      </ScreenStack>

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

Header.earhartHeader = true;

Header.Left = ScreenStackHeaderLeftView;
Header.Right = ScreenStackHeaderRightView;
Header.Center = ScreenStackHeaderCenterView;

export { Stack, Header };
