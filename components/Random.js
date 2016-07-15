// @flow

import React from 'react'
import shortid from 'shortid'
import _ from 'lodash'

import {
  ScrollView,
  LayoutAnimation,
  KeyboardAvoidingView,
  Alert
} from 'react-native'

import type {
  CollectionType,
  RandomListType,
  ItemType
} from './data/reducer'

import {
  TouchableRow,
  InputGroup,
  InputAddRow,
  InputRow,
  Base,
  Button,
  Icon,
  TouchableRowCell,
  Text,
  ArrowRightIcon
} from 'panza'

import SortableListView from 'react-native-sortable-listview'

type PropsType = {
  list: RandomListType;
  dispatch: Function;
  onRequestReturn: Function;
  editing: boolean;
  onRequestPlay: Function;
}

type LayoutType = {
  x: number;
  y: number;
  height: number;
  width: number;
}

export default class RandomList extends React.Component {

  props: PropsType;
  _pauseUpdate: boolean;

  state: {
    layout?: LayoutType;
    content?: {
      width: number;
      height: number;
    }
  }

  _scrollView: any;

  constructor(props: PropsType) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps(nextProps: PropsType) {
    if (this._pauseUpdate) return

    if (!nextProps.editing && this.props.editing) {
      this._validateOnFinish()
    }
     else if (nextProps.editing && !this.props.editing) {
       LayoutAnimation.easeInEaseOut()
     }
  }

  shouldComponentUpdate() {
    if (this._pauseUpdate) {
      return false
    }

    return true
  }

  render() {

    const {
      list,
      editing
    } = this.props

    const { name, items } = list

    return (
      <KeyboardAvoidingView
        behavior='padding'
        style={{ flex: 1 }}>
        <ScrollView
          ref={(scrollView) => this._scrollView = scrollView}
          onLayout={this._onLayout.bind(this)}
          onContentSizeChange={this._onContentSizeChange.bind(this)}
          keyboardShouldPersistTaps={true}
          automaticallyAdjustContentInsets={false}
          style={{ flex: 1, paddingBottom: 20 }}>

          {!editing && (
            <InputGroup mt={3}>
              <TouchableRowCell
                onPress={this.props.onRequestPlay}
                showMoreProps={{ color: 'primary' }}
                height={50}>
                <Base row flex={1} align='center'>
                  <Icon mr={2} color='primary' size={35} name='ios-play' />
                  <Text primary color='primary'>Play Mode</Text>
                </Base>
              </TouchableRowCell>
            </InputGroup>
          )}

          {editing && (
            <InputGroup showTopBorder={false}>
              <InputRow
                placeholder='List Name'
                editable={editing}
                value={name}
                onChangeText={this._updateName.bind(this)}
              />
            </InputGroup>
          )}

          {!(!editing && (items.length === 0)) && (
            <InputGroup mt={3}>
              {items.map((item, i) => (
                <InputRow
                  removable={editing}
                  editable={editing}
                  autoFocus={(i === items.length - 1)}
                  condensed
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
              {editing && (
                <InputAddRow
                  condensed
                  labelColor='primary'
                  label='Add Routine Item'
                  onPress={this._addNew.bind(this)}
                />
              )}
            </InputGroup>
          )}

          {editing && (
            <InputGroup mt={3}>
              <TouchableRowCell onPress={this._deleteList.bind(this)} height={50}>
                <Base flex={1}>
                  <Text primary color='negative'>Delete List</Text>
                </Base>
              </TouchableRowCell>
            </InputGroup>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
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

  _deleteList(){

    Alert.alert(
      'Delete this List?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          this._pauseUpdate = true
          try {
            this.props.dispatch(
              {
                type: 'DELETE_LIST',
                listId: this.props.list.id
              }
            )
          } catch(err) {
            this._pauseUpdate = false
            console.error(err)
          }
          this.props.onRequestReturn()
        }}
      ]
    )

  }

  _validateOnFinish() {
    LayoutAnimation.easeInEaseOut()
    this.props.list.items.forEach(item => {
      if (item.name.length > 0) return
      this._removeRow(item.id)
    })
  }

  _updateName(name: string) {
    this.props.dispatch(
      {
        type: 'CHANGE_LIST_META',
        listId: this.props.list.id,
        name
      }
    )
  }

  _addNew() {
    LayoutAnimation.spring()
    this.props.dispatch(
      {
        type: 'ADD_ITEM',
        item: {
          id: shortid.generate(),
          name: '',
        },
        listId: this.props.list.id
      }
    )

    // run after update?
    const { layout, content } = this.state
    if (layout && content && content.height) {
      if (content.height > layout.height) {
        this._scrollView.scrollTo({
          y: (content.height - layout.height) - 30
        })
      }
    }

  }

  _removeRow(id: string) {
    LayoutAnimation.spring()

    this.props.dispatch(
      {
        type: 'DELETE_LIST_ITEM',
        listId: this.props.list.id,
        id
      }
    )

  }

  _onChangeItem(id: string, text: string) {

    this.props.dispatch(
      {
        type: 'CHANGE_ITEM',
        listId: this.props.list.id,
        id,
        name: text
      }
    )

  }


}
