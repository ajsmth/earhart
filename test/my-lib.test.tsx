import React from 'react'
import { render } from '@testing-library/react-native'
import { MyLib } from '../src'

test('render()', () => {
  const { debug } = render(<MyLib />)

  debug()
})