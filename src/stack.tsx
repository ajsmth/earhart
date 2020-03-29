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
import { INavigatorState } from './library';

interface IStack {
  children: React.ReactNode;
}

// RNS doens't allow rendering non-<Screen /> children
// styles aren't really applied to <Screen /> so we can't render it with nothing
// we get around this by rendering routes without their children below
// routes are properly registered and everything works fine
// bit of a hack but it has no noticeable impact

function Stack({ children }: IStack) {
  const { activeIndex, navigate, params } = useNavigator();

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

          let headerProps: Partial<ScreenStackHeaderConfigProps> = {
            hidden: true,
          };

          let _children: any[] = [];

          // extract header from route children
          // android will render <HeaderConfig /> even if its nested so it needs to be removed
          if (Array.isArray(child.props.children)) {
            for (let i = 0; i < child.props.children.length; i++) {
              const _child = child.props.children[i];
              if (_child.type.earhartHeader) {
                headerProps = extractHeaderProps(_child.props, {
                  activeIndex,
                  navigate,
                  params,
                });
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
              <ScreenStackHeaderConfig {...headerProps} />

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

function extractHeaderProps(
  props: ScreenStackHeaderConfigProps,
  navigatorState: INavigatorState
) {
  return Object.keys(props).reduce((acc, val: string) => {
    // @ts-ignore
    const prop = props[val];

    if (typeof prop === 'function') {
      return {
        ...acc,
        [val]: prop(navigatorState),
      };
    }

    return {
      ...acc,
      [val]: prop,
    };
  }, {});
}

type DynamicHeaderProp = (navigatorState: INavigatorState) => string;

interface IHeaderProps extends Omit<ScreenStackHeaderConfigProps, 'title'> {
  title?: string | DynamicHeaderProp;
}

function Header(props: IHeaderProps) {
  return null;
}

Header.earhartHeader = true;

Header.Left = ScreenStackHeaderLeftView;
Header.Right = ScreenStackHeaderRightView;
Header.Center = ScreenStackHeaderCenterView;

export { Stack, Header };
