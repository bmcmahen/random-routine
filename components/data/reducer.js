import _ from 'lodash'
import { combineReducers } from 'redux'

export type ItemType = {
  id: String;
  name: String;
}

export type RandomListType = {
  id: String;
  name: String;
  items: Array<ItemType>
}

export type CollectionType = Array<RandomList>

/**
 * The random action
 */

const random = (
  state: ItemType,
  action: any
): ItemType => {

  switch (action.type) {

  case 'ADD_ITEM':
    return {
      id: action.item.id,
      name: action.item.name
    }

  case 'CHANGE_ITEM':
    if (state.id !== action.id) {
      return state
    }
    return Object.assign({}, state, {
      name: action.name
    })

  default:
    return state

  }
}

/**
 * A list of random actions
 */

const randoms = (
  state: RandomListType = {},
  action: any
): RandomListType => {

  if (action.type === 'ADD_LIST') {
    return {
      id: action.id,
      name: action.name,
      items: action.items.map(item => random(null, {
        type: 'ADD_ITEM',
        item
      }))
    }
  }

  // Any actions that operate on a list must include
  // a listId in the action
  if (state.id !== action.listId) {
    return state
  }

  switch (action.type) {

  case 'ADD_ITEM':
    return {
      ...state,
      items: [...state.items, random(null, action)]
    }

  case 'CHANGE_ITEM':
    return {
      ...state,
      items: state.items.map(item => random(item, action))
    }

  case 'DELETE_LIST_ITEM':
    const without = _.filter(state.items, (item) => item.id !== action.id)
    return {
      ...state,
      items: without
    }

  default:
    return state
  }
}

/**
 * A list of lists
 */

const randomList = (
  state: CollectionType = [],
  action: any
): CollectionType => {

  switch (action.type) {

  case 'ADD_LIST':
    return [...state, randoms(null, action)]

  case 'CHANGE_ITEM':
  case 'ADD_ITEM':
  case 'DELETE_LIST_ITEM':
  case 'CHANGE_LIST_META':
    return state.map(s =>
      randoms(s, action)
    )

  case 'DELETE_LIST':
    const { listId } = action
    return _.filter(state, (item) => item.id !== listId)

  case 'RESET':
    return []

  default:
    return state

  }
}

export default combineReducers({
  collection: randomList
})
