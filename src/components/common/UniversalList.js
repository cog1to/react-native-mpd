import React from 'react'

import {
  View,
  Styles,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native'

import PropTypes from 'prop-types'

import DraggableFlatList from 'react-native-draggable-flatlist'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'

import ListItem from './ListItem'
import ListTileItem from './ListTileItem'
import EmptyListTileItem from './EmptyListTileItem'
import CoverItem from './CoverItem'
import TitleItem from './TitleItem'

import ThemeManager from '../../themes/ThemeManager'

class UniversalList extends React.Component {
  static propTypes = {
    // Content list.
    content: PropTypes.arrayOf(
      PropTypes.shape({
        index: PropTypes.number,
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        artist: PropTypes.string,
        albumArtist: PropTypes.string,
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

    // Style
    mode: PropTypes.string,
    theme: PropTypes.string
  }

  // Item rendering.

  keyExtractor = (item) => {
    return '' + item.index
  }

  renderItem = ({ item, index, drag, onDragEnd, isActive }) => {
    const { editing, canDelete, canAdd, canRearrange, canEdit, mode, theme } = this.props
    const { id, name, type, artist = null, path, title, selected, status, subtitle, albumArtist = null } = item
    
    if (type == 'COVER') {
      return (
        <CoverItem
          path={path}
          theme={theme}
        />
      )
    }

    if (type == 'TITLE') {
      return (
        <TitleItem
          title={title}
          subtitle={subtitle}
          url={path}
          artist={artist}
          theme={theme}
        />
      )
    }

    let displayName = title != null ? title : name
    let displayType = artist != null ? artist : type

    const themeValue = ThemeManager.instance().getTheme(theme)

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

        onDelete={() => this.handleDelete(item)}
        onTap={() => this.handleTap(item)}
        onLongTap={canEdit ? () => this.handleLongTap(item) : null}
        onMenu={() => this.handleMenu(item)}

        move={drag}
        moveEnd={onDragEnd}

        theme={theme}
      />
    )
  }

  renderTileItem = ({ item, index }) => {
    const numColumns = Math.floor((Dimensions.get('window').width - 16) / 160)
    const width = (Dimensions.get('window').width - 16) / numColumns

    // Check if it's a filler tile.
    const { id, isEmpty = false } = item
    if (isEmpty) {
      return (
        <EmptyListTileItem
          height={UniversalList.TILE_HEIGHT}
          width={width}
          id={id}
        />
      )
    }

    // If not a filler, proceed with normal tile render.
    const { editing, canDelete, canAdd, canRearrange, canEdit, mode, theme } = this.props
    const { name, type, artist = null, path, title, selected, status, subtitle, albumArtist = null } = item
    
    let displayName = title != null ? title : name
    let displayType = artist != null ? artist : type

    return (
      <ListTileItem
        height={UniversalList.TILE_HEIGHT}
        width={width}
        title={displayName}
        subtitle={displayType}
        artist={artist}
        id={id}
        index={index}
        type={type}
        selected={selected}
        status={status}
        editing={editing}

        draggable={canRearrange}
        canAddItems={canAdd}
        canDelete={canDelete}

        onDelete={() => this.handleDelete(item)}
        onTap={() => this.handleTap(item)}
        onLongTap={canEdit ? () => this.handleLongTap(item) : null}
        onMenu={() => this.handleMenu(item)}

        theme={theme}
      />
    )
  }

  // Root rendering.

  static ITEM_HEIGHT = 60 
  static TILE_HEIGHT = 110 

  getItemLayout = (data, index) => {
    const { mode } = this.props
    const height = (mode === 'list') ? UniversalList.ITEM_HEIGHT : UniversalList.TILE_HEIGHT

    return {
      length: height,
      offset: index * height,
      index,
    }
  }

  render() {
    const { content, refreshing, onRefresh, extraData, mode, theme } = this.props
    const themeValue = ThemeManager.instance().getTheme(theme)

    if (mode === 'list') {
      return (
        <DraggableFlatList
          activationDistance={20}
          data={content}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          onDragEnd={(data) => this.handleMoveEnd(data)}
          getItemLayout={this.getItemLayout}
          refreshing={refreshing}
          onRefresh={onRefresh}
          extraData={extraData}
          style={{backgroundColor: themeValue.backgroundColor}}
        />
      )
    } else {
      const numColumns = Math.floor((Dimensions.get('window').width - 16) / 160)

      return(
        <FlatList
          style={{...styles.tileList, backgroundColor: themeValue.backgroundColor}}
          data={formatTiledContent(content, numColumns)}
          renderItem={this.renderTileItem}
          keyExtractor={this.keyExtractor}
          getItemLayout={this.getItemLayout}
          refreshing={refreshing}
          onRefresh={onRefresh}
          extraData={{...extraData, numColumns}}
          numColumns={numColumns}
        />
      )
    }
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

const formatTiledContent = (content, numColumns) => {
  const numberOfFullRows = Math.floor(content.length / numColumns)

  // Add empty cells to fill the last row.
  let numberOfElementsInLastRow = content.length - (numberOfFullRows * numColumns)
  while (numberOfElementsInLastRow != numColumns && numberOfElementsInLastRow !== 0) {
    content.push({ id: 'blank-' + numberOfElementsInLastRow, isEmpty: true })
    numberOfElementsInLastRow += 1
  }

  return content
}

const styles = StyleSheet.create({
  tileList: {
    marginHorizontal: 8,
    marginTop: 4
  }
})

export default gestureHandlerRootHOC(UniversalList)
