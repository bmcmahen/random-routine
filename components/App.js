// @flow

import React, { PropTypes } from 'react'
import {
  Navigator,
  Platform
} from 'react-native'

import {
  Base,
  NavBar,
  NavTitle
} from 'panza'

import { connect } from 'react-redux'

import type {
  CollectionType,
  RandomListType,
  ItemType
} from './data/reducer'

import Nav from './Navigator'
import AddRandomCollection from './AddRandomCollection'

class App extends React.Component {

  props: {
    dispatch: Function;
    collection: CollectionType;
  }

  render() {

    return (
      <Navigator
        initialRoute={{ id: 'home' }}
        style={{ flex: 1, backgroundColor: 'black' }}
        configureScene={(route) => {
          return Platform.OS === 'ios'
            ? Navigator.SceneConfigs.FloatFromBottom
            : Navigator.SceneConfigs.FloatFromBottomAndroid
        }}
        renderScene={(route, nav) => {

          if (route.id === 'home') {
            return (
              <Nav
                onRequestAdd={() => nav.push({ id: 'add'})}
                {...this.props}
              />
            )
          }

          if (route.id === 'add') {
            return (
              <AddRandomCollection
                onRequestClose={() => nav.pop()}
                {...this.props}
              />
            )
          }

        }}
      />
    )
  }

}

function getState(state) {
  return {
    collection: state.collection
  }
}

export default connect(getState)(App)
