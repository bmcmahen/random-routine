// @flow

import React, { PropTypes } from 'react'
import {
  Navigator
} from 'react-native'
import _ from 'lodash'

import {
  Base,
  NavBar,
  NavTouchableIcon,
  PlusIcon,
  NavTouchableText,
  NavTitle,
  BackIcon
} from 'panza'

import Randoms from './Randoms'
import Random from './Random'
import Play from './Play'

import type {
  CollectionType,
  RandomListType
} from './data/reducer'

type PropsType = {
  onRequestAdd: Function;
  dispatch: Function;
  collection: CollectionType;
}

type StateType = {
  listIndex?: number;
  editing: boolean;
  progress?: Array<number>;
}

export default class Nav extends React.Component {

  props: PropsType;
  state: StateType;

  _routeMapper: Object;

  constructor(props: PropsType) {

    super(props)

    this.state = {
      editing: false
    }

    this._routeMapper = {
      LeftButton: (route, nav, index) => {
        if (index > 0) {
          return (
            <NavTouchableIcon
              onPress={() => {
                this.setState({ editing: false })
                nav.pop()
              }}
              accessibilityLabel='Back'>
                <BackIcon />
            </NavTouchableIcon>
          )
        }
      },
      RightButton: (route, nav) => {
        if (route.id === 'taskList') {
          return (
            <NavTouchableIcon
              onPress={this.props.onRequestAdd}
              accessibilityLabel='Add Random List'>
                <PlusIcon />
              </NavTouchableIcon>
          )
        }

        if (route.id === 'list') {
          return this.state.editing
            ? (
              <NavTouchableText onPress={() => this.setState({ editing: false })}>
                Done
              </NavTouchableText>
            )
            : (
              <NavTouchableText onPress={() => this.setState({ editing: true })}>
                Edit
              </NavTouchableText>
            )
        }
      },
      Title: (route, nav) => {
        if (route.title) {
          return <NavTitle>{route.title}</NavTitle>
        }

        if (route.id === 'play' && this.state.progress) {
          const [done, todo] = this.state.progress
          const title = todo === 0 ? 'Finished' : `${done}/${done + todo}`
          return (
            <NavTitle>{title}</NavTitle>
          )
        }
      }
    }
  }

  render(): ReactElement<any> {
    return (
      <Navigator
        initialRoute={{ title: 'Routines', id: 'taskList' }}
        style={{ flex: 1 }}
        navigationBar={
          <Navigator.NavigationBar
            style={[NavBar.defaultStyles]}
            routeMapper={this._routeMapper}
          />
        }
        sceneStyle={{
          paddingTop: NavBar.totalNavHeight,
          backgroundColor: 'white'
        }}
        renderScene={(route, nav) => {

          if (route.id === 'taskList') {
            return (
              <Randoms
                onSelectList={(list) => {
                  const i = _.findIndex(this.props.collection, (o) => o.id === list.id)
                  this.setState({ listIndex: i }, () => {
                    nav.push({ id: 'list', title: list.name })
                  })
                }}
                {...this.props}
              />
            )
          }

          if (route.id === 'list') {
            return (
              <Random
                editing={this.state.editing}
                list={this.props.collection[this.state.listIndex]}
                dispatch={this.props.dispatch}
                onRequestReturn={() => {
                  this.setState({ editing: false })
                  nav.pop()
                }}
                onRequestPlay={() => {
                  nav.push({ id: 'play' })
                }}
              />
            )
          }

          if (route.id === 'play') {
            return (
              <Play
                list={this.props.collection[this.state.listIndex]}
                onRequestReturn={() => nav.pop()}
                onUnmount={() => this.setState({ progress: undefined })}
                onProgressUpdate={(a, b) => {
                  this.setState({ progress: [a, b] })
                }}
              />
            )
          }

        }}
      />
    )
  }

}
