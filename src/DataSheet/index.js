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
import { List } from '../List';
import { useElementLayout, useDocumentEvent, useMergeRefs } from 'sugax';
import { default_state, useMethods } from './methods';

function TableCell({
    style,
    selectedStyle,
    selected,
    highlightColor,
    isEditing,
    children,
    ...props
}) {

    const ref = React.useRef();
    const [cellHeight, setCellHeight] = React.useState(0);

    useElementLayout(ref, (e) => setCellHeight(e.nativeEvent?.layout?.height ?? 0));

    const _style = StyleSheet.flatten([{
        zIndex: isEditing === true ? 1 : 0,
        border: 1,
        borderStyle: selected ? 'double' : 'solid',
        borderColor: selected ? '#2185D0' : '#DDD',
        boxShadow: selected ? `inset 0 -${cellHeight}px 0 ${highlightColor}` : null,
    }, selected ? selectedStyle : style]);

    return <td ref={ref} style={_style} {...props}>{children}</td>;
}

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
    rowNumbers = true,
    renderItem,
    style,
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
    const ref = useMergeRefs(tableRef, forwardRef);
    const [state, _setState] = React.useState(default_state);

    const setState = (next) => _setState(state => {
        if (!_.isNil(state.editing) && _.isNil(next.editing) && _.isFunction(onEndEditing)) onEndEditing(state.editing.row, state.editing.col);
        return allowSelection === true ? { ...state, ...next } : default_state
    });

    const {
        _current_selected_rows,
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
    });

    React.useImperativeHandle(forwardRef, () => ({
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
    const _selected_cells = allowSelection === true && _.isEmpty(state.selecting_rows) ? state.selecting_cells ?? state.selected_cells : null;

    const { start_row, start_col, end_row, end_col } = _selected_cells ?? {};
    const min_row = _.isEmpty(_selected_cells) ? null : Math.min(start_row, end_row);
    const max_row = _.isEmpty(_selected_cells) ? null : Math.max(start_row, end_row);
    const min_col = _.isEmpty(_selected_cells) ? null : Math.min(start_col, end_col);
    const max_col = _.isEmpty(_selected_cells) ? null : Math.max(start_col, end_col);

    const is_row_selected = (row) => _selected_rows.includes(row);
    const is_cell_selected = (row, col) => !_.isEmpty(_selected_cells) && min_row <= row && row <= max_row && min_col <= col && col <= max_col;
    const is_editing = !_.isEmpty(state.editing);
    const is_cell_editing = (row, col) => is_editing && row === state.editing.row && col === state.editing.col;

    useDocumentEvent('mousedown', is_editing ? null : onMouseDown);
    useDocumentEvent('mouseup', is_editing ? null : onMouseUp);
    useDocumentEvent('keydown', is_editing ? null : handleKey);
    useDocumentEvent('copy', is_editing ? null : handleCopy);
    useDocumentEvent('paste', is_editing ? null : handlePaste);

    return <table
    ref={ref}
    style={StyleSheet.flatten([{ 
        borderCollapse: 'collapse',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
    }, style])} {...props}>
        <thead
        style={StyleSheet.flatten([{
            position: 'sticky',
            tableLayout: 'fixed',
            top: 0,
            zIndex: 1,
        }, headerContainerStyle])}>
            <tr style={{ backgroundColor: '#F6F8FF' }}>
            {rowNumbers === true && <th />}
            <List data={columns} renderItem={({ item }) => <th
            style={StyleSheet.flatten([{
                padding: 4,
                position: 'relative', 
                border: 1, 
                borderStyle: 'solid',
                borderColor: '#DDD',
            }, headerItemContainerStyle])}><Text style={headerTextStyle}>{item}</Text></th>} />
            </tr>
        </thead>

        {_.isArray(data) && <tbody
        style={StyleSheet.flatten([{ backgroundColor: 'white' }, contentContainerStyle])}>

            <List data={data} renderItem={({ item: items, index: row }) => <tr
            style={StyleSheet.flatten([{ backgroundColor: row % 2 == 0 ? 'white' : '#F6F8FF' }, rowContainerStyle])}>

                {rowNumbers === true && <TableCell
                selected={is_row_selected(row)}
                onMouseDown={is_editing ? null : (e) => handleRowMouseDown(e, row)}
                onMouseOver={is_editing ? null : (e) => handleRowMouseOver(e, row)}
                highlightColor={highlightColor}
                style={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                }, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                }, selectedItemContainerStyle])}>
                    <Text style={{ fontFamily: 'monospace' }}>{row + 1}</Text>
                </TableCell>}

                <List data={_.map(columns, col => items[col])} renderItem={({ item, index: col }) => <TableCell 
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
                }, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                }, selectedItemContainerStyle])}>
                    <Text style={{ fontFamily: 'monospace' }}>{' '}</Text>
					<TableCellItem item={item} rowIdx={row} columnIdx={col} isEditing={is_cell_editing(row, col)} renderItem={renderItem} />
                </TableCell>} />

            </tr>} />

			{showEmptyLastRow === true && <tr
            style={StyleSheet.flatten([{ backgroundColor: data.length % 2 == 0 ? 'white' : '#F6F8FF' }, rowContainerStyle])}>

                {rowNumbers === true && <TableCell
                selected={is_row_selected(data.length)}
                onMouseDown={is_editing ? null : (e) => handleRowMouseDown(e, data.length)}
                onMouseOver={is_editing ? null : (e) => handleRowMouseOver(e, data.length)}
                highlightColor={highlightColor}
                style={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                }, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                }, selectedItemContainerStyle])} />}

                <List data={columns} renderItem={({ index: col }) => <TableCell
                isEditing={is_cell_editing(data.length, col)}
                selected={is_row_selected(data.length)}
                onDoubleClick={is_editing ? null : (e) => handleCellDoubleClick(e, data.length, col)}
                highlightColor={highlightColor}
                style={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                }, itemContainerStyle])}
                selectedStyle={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                }, selectedItemContainerStyle])}>
                    <Text style={{ fontFamily: 'monospace' }}>{' '}</Text>
					{is_cell_editing(data.length, col) && <TableCellItem rowIdx={data.length} columnIdx={col} isEditing={true} renderItem={renderItem} />}
                </TableCell>} />

            </tr>}

        </tbody>}
    </table>;
});

export default DataSheet;