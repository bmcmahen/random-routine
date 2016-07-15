// @flow

import React from 'react'
import {
  Base,
  NavBar,
  NavTouchableIcon,
  NavTouchableText,
  CloseIcon,
  InputRow,
  InputAddRow,
  InputGroup,
  Text
} from 'panza'

import shortid from 'shortid'
import _ from 'lodash'
import {
  addList
} from './data/action'

import {
  ScrollView,
  LayoutAnimation,
  KeyboardAvoidingView
} from 'react-native'

type PropsType = {
  dispatch: Function;
  onRequestClose: Function;
}

import type {
  RandomListType,
  ItemType
} from './data/reducer'

type LayoutType = {
  x: number;
  y: number;
  height: number;
  width: number;
}


export default class AddRandomCollection extends React.Component {

  props: PropsType;

  state: {
    name: string;
    items: Array<ItemType>;
    layout?: LayoutType;
    content?: {
      width: number;
      height: number;
    }
  }

  _scrollView: any;

  constructor(props:PropsType) {
    super(props)
    this.state = {
      name: '',
      items: []
    }
  }

  render() {

    const {
      name,
      items
    } = this.state

    const disabled = !name

    return (
        <Base flex={1} backgroundColor='white'>
          <NavBar
            title='Add Routine'
            LeftButton={
              <NavTouchableIcon
                onPress={() => this.props.onRequestClose()}
                accessibilityLabel='Close'>
                  <CloseIcon size={36} />
                </NavTouchableIcon>
            }
            RightButton={
              <NavTouchableText
                disabled={disabled}
                onPress={() => this._save()}
              >
                Save
              </NavTouchableText>
            }
          />
        <KeyboardAvoidingView
          behavior='padding'
          style={{ flex: 1 }}>
          <ScrollView
            onLayout={this._onLayout.bind(this)}
            keyboardShouldPersistTaps={true}
            onContentSizeChange={this._onContentSizeChange.bind(this)}
            automaticallyAdjustContentInsets={false}
            ref={(scrollView) => this._scrollView = scrollView}
            style={{ flex: 1, paddingBottom: 20 }}>
            <InputGroup showTopBorder={false}>
              <InputRow
                autoFocus
                placeholder='List Name'
                value={name}
                onChangeText={(name) => this.setState({ name })}
              />
            </InputGroup>
            <InputGroup mt={2}>
              {items.map(item => (
                <InputRow
                  removable
                  condensed
                  backgroundColor='white'
                  autoFocus
                  key={item.id}
                  value={item.name}
                  onChangeText={(text) => (
                    this._onChangeItem(item.id, text)
                  )}
                  placeholder='Item Name'
                  onRequestRemove={() => (
                    this._removeRow(item.id)
                  )}
                />
              ))}
              <InputAddRow
                key='add-row'
                condensed
                labelColor='primary'
                label='Add Routine Item'
                onPress={this._addNew.bind(this)}
              />
            </InputGroup>
          </ScrollView>
          </KeyboardAvoidingView>

        </Base>
    )
  }

  _onContentSizeChange(width: number, height: number) {
    this.setState({
      content: { width, height }
    })
  }

  _onLayout(e: Object) {
    this.setState({
      layout: e.nativeEvent.layout
    })
  }

  _addNew() {
    LayoutAnimation.spring()

    const items = [...this.state.items, {
      id: shortid.generate(),
      name: ''
    }]

    // after setting the items, scroll to the
    // bottom of the page. This is a bit hacky. There must
    // be a better way...
    this.setState({ items }, () => {
      const { layout, content } = this.state
      if (layout && content && content.height) {
        if (content.height > layout.height) {
          this._scrollView.scrollTo({
            y: (content.height - layout.height) + 40
          })
        }
      }
    })
  }

  _removeRow(id: string) {
    LayoutAnimation.spring()
    const items = _.filter(this.state.items, (item) => item.id !== id)
    this.setState({ items })
  }

  _onChangeItem(id: string, text: string) {
    const items = this.state.items.map(item => {
      if (item.id !== id) return item
      item.name = text
      return item
    })

    this.setState({ items })
  }

  _save() {

    // filter out the null values
    const items = _.filter(this.state.items, (item) => {
      return item.name.length > 0
    })

    try {
      this.props.dispatch(
        addList({
          name: this.state.name,
          items,
          id: shortid.generate()
        })
      )
      this.props.onRequestClose()
    } catch(err) {
      console.error(err)
    }
  }
}
