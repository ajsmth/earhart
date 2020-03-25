import React from 'react';
import { IndexContext } from './library';

interface INavigatorScreen {
  children: React.ReactNode;
  index: number;
}

function NavigatorScreen({ children, index }: INavigatorScreen) {
  return (
    <IndexContext.Provider value={index}>{children}</IndexContext.Provider>
  );
}

export { NavigatorScreen };
