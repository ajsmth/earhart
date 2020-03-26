import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenStack, Screen } from 'react-native-screens';
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
    <>
      <ScreenStack style={{ flex: 1 }}>
        {React.Children.map(children, (child: any, index) => {
          if (index > activeIndex) {
            return null;
          }

          const { header, ...screenProps } = child.props;

          return (
            <Screen
              stackPresentation="push"
              onDismissed={handleBack}
              style={StyleSheet.absoluteFill}
              {...screenProps}
            >
              {header || null}
              <View style={{ flex: 1 }}>
                <NavigatorScreen index={index}>
                  {child.props.children}
                </NavigatorScreen>
              </View>
            </Screen>
          );
        })}
      </ScreenStack>

      {React.Children.map(children, (child: any) => {
        return React.cloneElement(child, {
          children: null,
          style: { flex: 0 },
        });
      })}
    </>
  );
}

export { Stack };
