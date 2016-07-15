import type {
  RandomListType,
  ItemType,
  CollectionType
} from './reducer'

export function addRandom(text) {
  return function(dispatch, getState) {
    dispatch({
      type: 'ADD_RANDOM',
      text
    })
  }
}


export function addList(list:RandomListType) {
  return {
    type: 'ADD_LIST',
    id: list.id,
    name: list.name,
    items: list.items
  }
}
