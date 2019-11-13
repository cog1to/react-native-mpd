import React from 'react'

import {
  View,
} from 'react-native'

import PropTypes from 'prop-types'

import DraggableFlatList from 'react-native-draggable-flatlist'

import ListItem from './ListItem'

import ThemeManager from '../../themes/ThemeManager'

export default class UniversalList extends React.Component {
  static propTypes = {
    // Content list.
    content: PropTypes.arrayOf(
      PropTypes.shape({
        index: PropTypes.number,
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        artist: PropTypes.string,
        path: PropTypes.string,
        title: PropTypes.string,
        selected: PropTypes.bool,
        status: PropTypes.string,
      })
    ).isRequired,

    // State.
    editing: PropTypes.bool.isRequired,
    refreshing: PropTypes.bool,

    // Capabilities.
    canDelete: PropTypes.bool.isRequired,
    canAdd: PropTypes.bool.isRequired,
    canRearrange: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,

    // Callbacks.
    onRefresh: PropTypes.func,
    onItemTapped: PropTypes.func.isRequired,
    onItemLongTapped: PropTypes.func,
    onItemDeleted: PropTypes.func,
    onItemMoved: PropTypes.func,
    onItemMenu: PropTypes.func,
  }

  // Item rendering.

  keyExtractor = (item) => {
    return '' + item.index
  }

  renderItem = ({ item, index, move, moveEnd, isActive }) => {
    const { editing, canDelete, canAdd, canRearrange, canEdit } = this.props
    const { id, name, type, artist = null, path, title, selected, status } = item

    let displayName = title != null ? title : name
    let displayType = artist != null ? artist : type

    const theme = ThemeManager.instance().getCurrentTheme()

    return (
      <ListItem 
        height={UniversalList.ITEM_HEIGHT}
        title={displayName}
        subtitle={displayType}
        artist={artist}
        id={id}
        index={index}
        type={type}
        selected={selected || isActive}
        status={status}
        editing={editing}

        draggable={canRearrange}
        canAddItems={canAdd}
        canDelete={canDelete}

        activeColor={theme.activeColor}
        passiveColor={theme.lightTextColor}
        highlightColor={theme.accentColor + '50'}
        underlayColor={theme.accentBackgroundColor}

        onDelete={() => this.handleDelete(item)}
        onTap={() => this.handleTap(item)}
        onLongTap={canEdit ? () => this.handleLongTap(item) : null}
        onMenu={() => this.handleMenu(item)}

        move={move}
        moveEnd={moveEnd}
      />
    )
  }

  // Root rendering.

  static ITEM_HEIGHT = 60 

  getItemLayout = (data, index) => ({
    length: UniversalList.ITEM_HEIGHT,
    offset: index * UniversalList.ITEM_HEIGHT,
    index,
  })

  render() {
    const { content, refreshing, onRefresh, extraData } = this.props

    return (
      <DraggableFlatList
        data={content}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        onMoveEnd={(data) => this.handleMoveEnd(data)}
        getItemLayout={this.getItemLayout}
        refreshing={refreshing}
        onRefresh={onRefresh}
        extraData={extraData}
      />
    )
  }

  // Event handling.
  
  handleTap = (item) => {
    this.props.onItemTapped(item)
  }

  handleLongTap = (item) => {
    this.props.onItemLongTapped(item)
  }

  handleDelete = (item) => {
    this.props.onItemDelete(item)
  }

  handleMenu = (item) => {
    this.props.onItemMenu(item)
  }

  handleMoveEnd = (data) => {
    this.props.onItemMoved(data)
  }
}
