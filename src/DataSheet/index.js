//
//  index.js
//
//  The MIT License
//  Copyright (c) 2015 - 2022 Susan Cheng. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { List } from 'o2ter-ui';
import { useElementLayout, useDocumentEvent, useMergeRefs } from 'sugax';
import { default_state, useMethods } from './methods';

function TableHeaderCell({
    label,
    style,
    borderSize = 1,
    headerTextStyle,
    columnWidth,
    columnMinWidth,
    onColumnWidthChange,
    ...props
}) {

    const _columnWidth = columnWidth ?? 0;
    const _columnMinWidth = columnMinWidth ?? 0;

    const borderRef = React.useRef();

    return <th style={StyleSheet.flatten([{ width: Math.max(_columnWidth, _columnMinWidth) }, style])} {...props}>
        <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
            <Text style={[{ flex: 1, padding: 4 }, headerTextStyle]}>{label}</Text>
            <View ref={borderRef}
                onStartShouldSetResponder={(e) => e.target === borderRef.current}
                onMoveShouldSetResponder={(e) => e.target === borderRef.current}
                onStartShouldSetResponderCapture={() => false}
                onMoveShouldSetResponderCapture={() => false}
                onResponderTerminationRequest={() => false}
                onResponderMove={e => onColumnWidthChange(_columnWidth + e.nativeEvent.locationX - borderSize * 0.5)}
                onResponderRelease={e => onColumnWidthChange(_columnWidth + e.nativeEvent.locationX - borderSize * 0.5)}
                style={{ width: borderSize, cursor: 'col-resize' }} />
        </View>
    </th>;
}

const TableCell = React.forwardRef(({
    style,
    selectedStyle,
    selected,
    highlightColor,
    isEditing,
    children,
    ...props
}, forwardRef) => {

    const cellRef = React.useRef();
    const ref = useMergeRefs(cellRef, forwardRef);
    const [cellHeight, setCellHeight] = React.useState(0);

    useElementLayout(cellRef, (e) => setCellHeight(e.nativeEvent?.layout?.height ?? 0));

    const _style = StyleSheet.flatten([{
        zIndex: isEditing === true ? 1 : 0,
        boxShadow: selected ? `inset 0 -${cellHeight}px 0 ${highlightColor}` : null,
    }, selected ? selectedStyle : style]);

    return <td ref={ref} style={_style} {...props}>{children}</td>;
});

const TableCellItem = ({ item, rowIdx, columnIdx, isEditing, renderItem }) => <View 
style={{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: isEditing === true ? 0 : 4,
}}>
    {renderItem({ item, rowIdx, columnIdx, isEditing: isEditing })}
</View>;

export const DataSheet = React.forwardRef(({
    data,
    columns,
    columnWidth,
    columnMinWidth = 64,
    onColumnWidthChange,
    rowNumbers = true,
    renderItem,
    style,
    stickyHeader = true,
    stickyRowNumbers = true,
    headerContainerStyle,
    headerItemContainerStyle,
    headerTextStyle,
    rowContainerStyle,
    itemContainerStyle,
    selectedItemContainerStyle,
    contentContainerStyle,
    encodeValue,
    showEmptyLastRow,
    allowSelection = true,
    allowEditForCell = true,
    onDeleteRows,
    onDeleteCells,
    onCopyRows,
    onCopyCells,
    onPasteRows,
    onPasteCells,
    onSelectionChanged,
    onEndEditing,
    highlightColor = 'rgba(33, 133, 208, 0.15)',
    ...props
}, forwardRef) => {

    const tableRef = React.useRef();
    const editingRef = React.createRef();
    const ref = useMergeRefs(tableRef, forwardRef);
    const [state, _setState] = React.useState(default_state);
    const setState = (next) => _setState(state => allowSelection === true ? { ...state, ...next } : default_state);

    const {
        _current_selected_rows,
        _current_selected_cells,
        onMouseDown,
        onMouseUp,
        handleRowMouseDown,
        handleRowMouseOver,
        handleCellMouseDown,
        handleCellMouseOver,
        handleCellDoubleClick,
        handleKey,
        handleCopy,
        handlePaste,
    } = useMethods({
        state,
        setState,
        tableRef,
        editingRef,
        data,
        columns,
        encodeValue,
        allowSelection,
        allowEditForCell,
        onDeleteRows,
        onDeleteCells,
        onCopyRows,
        onCopyCells,
        onPasteRows,
        onPasteCells,
        onEndEditing,
    });

    React.useImperativeHandle(forwardRef, () => ({
        get editing() { return state.editing },
        get selectedRows() { return _.isEmpty(state.selected_cells) ? state.selected_rows ?? [] : [] },
        get selectedCells() {
            const { start_row, start_col, end_row, end_col } = state.selected_cells ?? {};
            const startRow = _.isEmpty(state.selected_cells) ? null : Math.min(start_row, end_row);
            const endRow = _.isEmpty(state.selected_cells) ? null : Math.max(start_row, end_row);
            const startCol = _.isEmpty(state.selected_cells) ? null : Math.min(start_col, end_col);
            const endCol = _.isEmpty(state.selected_cells) ? null : Math.max(start_col, end_col);
            return { startRow, startCol, endRow, endCol };
        },
        clearSelection: () => setState({ selecting_rows: null, selected_rows: [], selecting_cells: null, selected_cells: null }),
        endEditing: () => setState({ editing: null }),
    }));

    React.useEffect(() => { if (_.isFunction(onSelectionChanged)) onSelectionChanged(); }, [state.selected_rows, state.selected_cells]);

    const _selected_rows = allowSelection === true && _.isEmpty(state.selecting_cells) ? _current_selected_rows(state) : [];
    const _selected_cells = allowSelection === true && _.isEmpty(state.selecting_rows) ? _current_selected_cells(state) : null;

    const { start_row, start_col, end_row, end_col } = _selected_cells ?? {};
    const min_row = _.isEmpty(_selected_cells) ? null : Math.min(start_row, end_row);
    const max_row = _.isEmpty(_selected_cells) ? null : Math.max(start_row, end_row);
    const min_col = _.isEmpty(_selected_cells) ? null : Math.min(start_col, end_col);
    const max_col = _.isEmpty(_selected_cells) ? null : Math.max(start_col, end_col);

    const is_row_selected = (row) => _selected_rows.includes(row);
    const is_cell_selected = (row, col) => !_.isEmpty(_selected_cells) && min_row <= row && row <= max_row && min_col <= col && col <= max_col;
    const is_editing = !_.isEmpty(state.editing);
    const is_cell_editing = (row, col) => is_editing && row === state.editing.row && col === state.editing.col;

    useDocumentEvent('mousedown', onMouseDown);
    useDocumentEvent('mouseup', is_editing ? null : onMouseUp);
    useDocumentEvent('keydown', is_editing ? null : handleKey);
    useDocumentEvent('copy', is_editing ? null : handleCopy);
    useDocumentEvent('paste', is_editing ? null : handlePaste);

    const stickyHeaderStyle = stickyHeader === true ? {
        position: 'sticky',
        tableLayout: 'fixed',
        top: 0,
        zIndex: 1,
    } : {};

    const stickyRowNumberStyle = stickyRowNumbers === true ? {
        position: 'sticky',
        tableLayout: 'fixed',
        left: 0,
        zIndex: 1,
    } : {};

    return <table
    ref={ref}
    style={StyleSheet.flatten([{ 
        borderCollapse: 'separate',
        borderSpacing: 0,
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
    }, style])} {...props}>
        <thead
        style={StyleSheet.flatten([stickyHeaderStyle, headerContainerStyle])}>
            <tr style={{ backgroundColor: '#F6F8FF' }}>
            {rowNumbers === true && <th style={StyleSheet.flatten([{
                border: 1,
                borderStyle: 'solid',
                borderColor: '#DDD',
                borderBottomStyle: is_row_selected(0) ? 'double' : 'solid',
                borderBottomColor: is_row_selected(0) ? '#2185D0' : '#DDD',
            }, stickyRowNumberStyle])} />}
            <List data={columns} renderItem={({ item, index: col }) => <TableHeaderCell
            label={item}
            headerTextStyle={headerTextStyle}
            columnWidth={_.isArray(columnWidth) ? columnWidth[col] : null}
            columnMinWidth={columnMinWidth}
            onColumnWidthChange={_.isFunction(onColumnWidthChange) ? (width) => onColumnWidthChange(col, width) : null}
            style={StyleSheet.flatten([{
                position: 'relative',
                border: 1,
                borderLeft: 0,
                borderStyle: 'solid',
                borderColor: '#DDD',
                borderBottomStyle: is_row_selected(0) || is_cell_selected(0, col) ? 'double' : 'solid',
                borderBottomColor: is_row_selected(0) || is_cell_selected(0, col) ? '#2185D0' : '#DDD',
            }, headerItemContainerStyle])} />} />
            </tr>
        </thead>

        {_.isArray(data) && <tbody
        style={StyleSheet.flatten([{ backgroundColor: 'white' }, contentContainerStyle])}>

            <List data={data} renderItem={({ item: items, index: row }) => <tr
            style={StyleSheet.flatten(rowContainerStyle)}>

                {rowNumbers === true && <TableCell
                selected={is_row_selected(row)}
                onMouseDown={is_editing ? null : (e) => handleRowMouseDown(e, row)}
                onMouseOver={is_editing ? null : (e) => handleRowMouseOver(e, row)}
                highlightColor={highlightColor}
                style={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                    borderTop: 0,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'solid',
                    borderColor: '#DDD',
                    borderRightStyle: is_row_selected(row) || is_cell_selected(row, 0) ? 'double' : 'solid',
                    borderRightColor: is_row_selected(row) || is_cell_selected(row, 0) ? '#2185D0' : '#DDD',
                    borderBottomStyle: is_row_selected(row + 1) ? 'double' : 'solid',
                    borderBottomColor: is_row_selected(row + 1) ? '#2185D0' : '#DDD',
                    backgroundColor: row % 2 == 0 ? 'white' : '#F6F8FF',
                }, stickyRowNumberStyle, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                    borderTop: 0,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'double',
                    borderColor: '#2185D0',
                    backgroundColor: row % 2 == 0 ? 'white' : '#F6F8FF',
                }, stickyRowNumberStyle, selectedItemContainerStyle])}>
                    <Text style={{ fontFamily: 'monospace' }}>{row + 1}</Text>
                </TableCell>}

                <List data={_.map(columns, col => items[col])} renderItem={({ item, index: col }) => <TableCell
                ref={is_cell_editing(row, col) ? editingRef : null}
                isEditing={is_cell_editing(row, col)}
                selected={is_row_selected(row) || is_cell_selected(row, col)}
                onMouseDown={is_editing ? null : (e) => handleCellMouseDown(e, row, col)}
                onMouseOver={is_editing ? null : (e) => handleCellMouseOver(e, row, col)}
                onDoubleClick={is_editing ? null : (e) => handleCellDoubleClick(e, row, col)}
                highlightColor={highlightColor}
                style={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                    borderTop: 0,
                    borderLeft: rowNumbers === true || col != 0 ? 0 : 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'solid',
                    borderColor: '#DDD',
                    borderRightStyle: is_row_selected(row) || is_cell_selected(row, col + 1) ? 'double' : 'solid',
                    borderRightColor: is_row_selected(row) || is_cell_selected(row, col + 1) ? '#2185D0' : '#DDD',
                    borderBottomStyle: is_row_selected(row + 1) || is_cell_selected(row + 1, col) ? 'double' : 'solid',
                    borderBottomColor: is_row_selected(row + 1) || is_cell_selected(row + 1, col) ? '#2185D0' : '#DDD',
                    backgroundColor: row % 2 == 0 ? 'white' : '#F6F8FF',
                }, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                    borderTop: 0,
                    borderLeft: rowNumbers === true || col != 0 ? 0 : 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'double',
                    borderColor: '#2185D0',
                    backgroundColor: row % 2 == 0 ? 'white' : '#F6F8FF',
                }, selectedItemContainerStyle])}>
                    <Text style={{ fontFamily: 'monospace' }}>{' '}</Text>
					<TableCellItem item={item} rowIdx={row} columnIdx={col} isEditing={is_cell_editing(row, col)} renderItem={renderItem} />
                </TableCell>} />

            </tr>} />

			{showEmptyLastRow === true && <tr
            style={StyleSheet.flatten(rowContainerStyle)}>

                {rowNumbers === true && <TableCell
                selected={is_row_selected(data.length)}
                onMouseDown={is_editing ? null : (e) => handleRowMouseDown(e, data.length)}
                onMouseOver={is_editing ? null : (e) => handleRowMouseOver(e, data.length)}
                highlightColor={highlightColor}
                style={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                    borderTop: 0,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'solid',
                    borderColor: '#DDD',
                    backgroundColor: data.length % 2 == 0 ? 'white' : '#F6F8FF',
                }, stickyRowNumberStyle, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                    borderTop: 0,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'double',
                    borderColor: '#2185D0',
                    backgroundColor: data.length % 2 == 0 ? 'white' : '#F6F8FF',
                }, stickyRowNumberStyle, selectedItemContainerStyle])} />}

                <List data={columns} renderItem={({ index: col }) => <TableCell
                ref={is_cell_editing(data.length, col) ? editingRef : null}
                isEditing={is_cell_editing(data.length, col)}
                selected={is_row_selected(data.length)}
                onDoubleClick={is_editing ? null : (e) => handleCellDoubleClick(e, data.length, col)}
                highlightColor={highlightColor}
                style={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                    borderTop: 0,
                    borderLeft: rowNumbers === true || col != 0 ? 0 : 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'solid',
                    borderColor: '#DDD',
                    backgroundColor: data.length % 2 == 0 ? 'white' : '#F6F8FF',
                }, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                    borderTop: 0,
                    borderLeft: rowNumbers === true || col != 0 ? 0 : 1,
                    borderBottom: 1,
                    borderRight: 1,
                    borderStyle: 'double',
                    borderColor: '#2185D0',
                    backgroundColor: data.length % 2 == 0 ? 'white' : '#F6F8FF',
                }, selectedItemContainerStyle])}>
                    <Text style={{ fontFamily: 'monospace' }}>{' '}</Text>
					{is_cell_editing(data.length, col) && <TableCellItem rowIdx={data.length} columnIdx={col} isEditing={true} renderItem={renderItem} />}
                </TableCell>} />

            </tr>}

        </tbody>}
    </table>;
});

export default DataSheet;