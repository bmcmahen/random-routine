// @flow

import React from 'react'
import {
  ListView
} from 'react-native'
import _ from 'lodash'

import {
  TouchableRow,
  Base,
  Text,
  Divider,
  Button
} from 'panza'

import type {
  CollectionType,
  RandomListType
} from './data/reducer'

type PropsType = {
  collection: CollectionType;
  dispatch: Function;
  onSelectList: Function;
  onRequestAdd: Function;
}

type StateType = {
}

export default class Randoms extends React.Component {

  props: PropsType;
  state: StateType;

  _ds: any;
  _renderRow: Function;

  constructor(props: PropsType) {
    super(props)
    this._renderRow = this._renderRow.bind(this)
    this._ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    })
    this.state = {}
  }

  render(): ReactElement<any> {
    const {
      collection,
      onRequestAdd
    } = this.props

    // show empty state
    if (collection.length === 0) {
      return (
        <Base flex={1} py={4} px={2} align='center'>
          <Text textAlign='center' large bold mb={2}>No routines listed.</Text>
          <Text light textAlign='center'>Would you like to create a routine?</Text>
          <Base mt={3}>
            <Button primary onPress={onRequestAdd}>
              Create a Routine
            </Button>
          </Base>
        </Base>
      )
    }

    const sorted = _.sortBy(collection, (o) => o.name)
    const data = this._ds.cloneWithRows(sorted)
    return (
      <ListView
        style={{ flex: 1 }}
        dataSource={data}
        renderSeparator={(a, b) => <Divider key={a + b} inset={16} />}
        renderRow={this._renderRow}
      />
    )
  }

  _renderRow(rowData: RandomListType): ReactElement<any> {
    return (
      <TouchableRow
        key={rowData.id}
        primaryText={rowData.name}
        showMore
        value={String(rowData.items.length)}
        onPress={() => this.props.onSelectList(rowData)}
      />
    )
  }
}
