import React from 'react';
import { StyleSheet } from 'react-native';
import { ScreenContainer, Screen } from 'react-native-screens';
import { useNavigator } from './hooks';
import { NavigatorScreen } from 'screen';

interface ISwitch {
  children: React.ReactNode;
}

// RNS doens't allow rendering non-<Screen /> children
// styles aren't really applied to <Screen /> so we can't render it with nothing
// we get around this by rendering routes without their children below
// routes are properly registered and everything works fine
// bit of a hack but it has no noticeable impact

function Switch({ children }: ISwitch) {
  const { activeIndex } = useNavigator();

  return (
    <>
      <ScreenContainer style={{ flex: 1 }}>
        {React.Children.map(children, (child: any, index) => {
          const active = index === activeIndex ? 1 : 0;

          return (
            // @ts-ignore
            <Screen active={active} style={StyleSheet.absoluteFill}>
              <NavigatorScreen index={index}>
                {child.props.children}
              </NavigatorScreen>
            </Screen>
          );
        })}
      </ScreenContainer>
      {React.Children.map(children, (child: any) => {
        return React.cloneElement(child, {
          children: null,
          style: { flex: 0 },
        });
      })}
    </>
  );
}

export { Switch };
