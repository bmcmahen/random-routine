// @flow

import React from 'react'
import _ from 'lodash'

import {
  LayoutAnimation,
  Animated,
  Dimensions,
  InteractionManager,
  View,
  TouchableHighlight,
  StyleSheet
} from 'react-native'

import type {
  CollectionType,
  RandomListType,
  ItemType
} from './data/reducer'

import {
  CheckMark,
  Button,
  Base,
  Text,
  NavBar,
  TouchableRowCell
} from 'panza'

const screen = Dimensions.get('window')

class Done extends React.Component {

  state: {
    scale: any;
  }

  constructor(props) {
    super(props)
    this.state = {
      scale: new Animated.Value(0)
    }
  }

  componentDidMount() {
    Animated.spring(
      this.state.scale,
      { toValue: 1 }
    ).start()
  }

  render() {
    return (
      <Animated.View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: this.state.scale,
        transform: [{ scale: this.state.scale }]
      }}>
        <Button outline primary mt={2} style={{ alignSelf: 'center'}} onPress={() => {
          this.props.restart()
        }}>Start again</Button>
      </Animated.View>
    )
  }
}

type PropsType = {
  list: RandomListType;
  onRequestReturn: Function;
  onProgressUpdate: Function;
  onUnmount: Function;
}

type StateType = {
  completed: Array<ItemType>;
  upcoming: Array<ItemType>;
  current?: ItemType;
  showAll: boolean;
}

export default class Play extends React.Component {

  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props)
    const init = this.generateInitialRandomValues(props.list)
    this.state = {
      showAll: false,
      ...init
    }

    this.updateProgress(this.state)
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ showAll: true })
    })
  }

  componentWillUnmount() {
    this.props.onUnmount()
  }

  updateProgress(state: StateType) {
    const done = state.completed.length
    const todo = state.upcoming.length + (state.current ? 1 : 0)
    this.props.onProgressUpdate(done, todo)
  }

  generateInitialRandomValues(list: RandomListType) {
    const upcoming = _.shuffle([...list.items])

    return {
      current: upcoming[0],
      upcoming: upcoming.slice(1),
      completed: []
    }

  }

  markCurrentAsCompleted() {
    const upcoming = [...this.state.upcoming]
    const completed = [...this.state.completed, this.state.current]
    const update: StateType = {
      current: upcoming.length > 0 ? upcoming[0] : null,
      upcoming: upcoming.slice(1),
      completed,
      showAll: true
    }

    this.setState(update)
    this.updateProgress(update)
  }

  render() {
    const {
      completed,
      current,
      upcoming
    } = this.state

    const hasCurrent = current
    const all = [...completed, current].slice(-10)
    const len = all.length
    const height = (screen.height - NavBar.totalNavHeight - (screen.height / 5)) / 10

    return (
      <Base flex={1}>

      {this.state.showAll && (

        <Base style={{ position: 'relative' }} p={4} align='center' justify='flex-end' flex={1}>
          {all.map((item, i) => {
            if (!item) return null

            const size = i === len - 1 ? 1 : 0.65
            const pos = i === len - 1
              ? (screen.height - (NavBar.totalNavHeight) - (screen.height / 5))
              : (i * (height -1)) - 1

            return (
              <Item
                isActive={i === len - 1}
                key={item.id}
                maxIndex={len}
                height={height}
                size={size}
                pos={pos}
                next={() => {
                  this.markCurrentAsCompleted()
                }}
                item={item}
              />
            )
          })}
        </Base>

      )}

        {!hasCurrent && (
          <Done restart={() => {
            this.setState(this.generateInitialRandomValues(this.props.list))
          }} />
        )}
      </Base>
    )
  }

}

class Item extends React.Component {

  props: {
    maxIndex: number;
    size: number;
    pos: number;
    item: ItemType;
    isActive: boolean;
    height: number;
    next: Function;
  }

  state: {
    animated: any;
    position: any;
  }

  constructor(props) {
    super(props)
    this.state = {
      animated: new Animated.Value(0.3),
      position: new Animated.Value(props.pos + 50)
    }
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    Animated.parallel(
      [
        Animated.spring(
          this.state.animated,
          { toValue: nextProps.size }
        ),
        Animated.spring(
          this.state.position,
          { toValue: nextProps.pos }
        )
      ]
    ).start()

  }

  render() {

    const { item, isActive } = this.props

    const scale = this.state.animated.interpolate({
      inputRange: [0.5, 1],
      outputRange: [0.5, 1]
    })

    const opacity = this.state.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    })

    const height = this.state.animated.interpolate({
      inputRange: [0.65, 1],
      outputRange: [this.props.height, 60]
    })

    return (
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        height,
        alignItems: 'flex-start',
        justifyContent: 'center',

        borderColor: 'rgba(0,0,0,0.25)',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        transform: [{ translateY: this.state.position }],
        opacity
      }}>

        <Animated.View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', transform: [{ scale }]}}>
        <TouchableHighlight underlayColor='#fafafa' style={{ flex: 1}} onPress={this.props.next}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
          <Text color='black' giant>
            {item.name}
          </Text>
          <CheckMark ml={2} isChecked={!isActive} />
        </View>
        </TouchableHighlight>

        </Animated.View>

      </Animated.View>
    )
  }
}
