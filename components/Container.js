import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import reducers from './data/reducer'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import { persistStore, autoRehydrate } from 'redux-persist'
import {
  View,
  AsyncStorage
} from 'react-native'

import App from './App'

import {
  customizeTheme
} from 'panza'

// customizeTheme({
//   colors: {
//     black: '#013509',
//     primary: '#47a99b',
//     default: '#013509'
//   }
// })

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent
console.disableYellowBox = true

class Container extends React.Component {

  constructor() {
    super()

    const logger = createLogger({
      predicate: (getState, action) => isDebuggingInChrome,
      collapsed: true,
      duration: true
    })

    const createAppStore = applyMiddleware(
      thunk,
      logger
    )(createStore)

    const store = autoRehydrate()(createAppStore)(reducers)

    persistStore(store, {
      storage: AsyncStorage
    }, () => {
      this.setState({ loading: false })
    })

    if (isDebuggingInChrome) {
      window.store = store
    }

    this.state = {
      loading: true,
      store
    }
  }

  render() {
    if (this.state.loading) {
      return <View />
    }

    return (
      <Provider store={this.state.store}>
        <App />
      </Provider>
    )

  }
}


export default Container
