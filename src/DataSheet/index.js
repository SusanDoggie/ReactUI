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
import { default_state, _encodeData, useMethods } from './methods';

function TableCell({
    style,
    selectedStyle,
    selected,
    highlightColor,
    children,
    ...props
}) {

    const ref = React.useRef();
    const [cellHeight, setCellHeight] = React.useState(0);

    useElementLayout(ref, (e) => setCellHeight(e.nativeEvent?.layout?.height ?? 0));

    const _style = StyleSheet.flatten([{
        border: 1,
        borderStyle: selected ? 'double' : 'solid',
        borderColor: selected ? '#2185D0' : '#DDD',
        boxShadow: selected ? `inset 0 -${cellHeight}px 0 ${highlightColor}` : null,
    }, selected ? selectedStyle : style]);

    return <td ref={ref} style={_style} {...props}>{children}</td>;
}

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
    allowedSelection = true,
    onDeleteRows,
    onDeleteCells,
    onCopyRows,
    onCopyCells,
    onPasteRows,
    onPasteCells,
    onSelectionChanged,
    highlightColor = 'rgba(33, 133, 208, 0.15)',
    ...props
}, forwardRef) => {

    const tableRef = React.useRef();
    const ref = useMergeRefs(tableRef, forwardRef);
    const [state, _setState] = React.useState(default_state);
    const setState = (next) => _setState(state => allowedSelection === true ? { ...state, ...next } : default_state);

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
        allowedSelection,
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
    }));

    React.useEffect(() => { if (_.isFunction(onSelectionChanged)) onSelectionChanged(); }, [state.selected_rows, state.selected_cells]);

    useDocumentEvent('mousedown', onMouseDown);
    useDocumentEvent('mouseup', onMouseUp);
    useDocumentEvent('keydown', handleKey);
    useDocumentEvent('copy', handleCopy);
    useDocumentEvent('paste', handlePaste);

    const _selected_rows = allowedSelection === true && _.isEmpty(state.selecting_cells) ? _current_selected_rows(state) : [];
    const _selected_cells = allowedSelection === true && _.isEmpty(state.selecting_rows) ? state.selecting_cells ?? state.selected_cells : null;

    const { start_row, start_col, end_row, end_col } = _selected_cells ?? {};
    const min_row = _.isEmpty(_selected_cells) ? null : Math.min(start_row, end_row);
    const max_row = _.isEmpty(_selected_cells) ? null : Math.max(start_row, end_row);
    const min_col = _.isEmpty(_selected_cells) ? null : Math.min(start_col, end_col);
    const max_col = _.isEmpty(_selected_cells) ? null : Math.max(start_col, end_col);

    const is_row_selected = (row) => _selected_rows.includes(row);
    const is_cell_selected = (row, col) => !_.isEmpty(_selected_cells) && min_row <= row && row <= max_row && min_col <= col && col <= max_col;

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
            zIndex: 100,
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
                onMouseDown={(e) => handleRowMouseDown(e, row)}
                onMouseOver={(e) => handleRowMouseOver(e, row)}
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
                selected={is_row_selected(row) || is_cell_selected(row, col)}
                onMouseDown={(e) => handleCellMouseDown(e, row, col)}
                onMouseOver={(e) => handleCellMouseOver(e, row, col)}
                onDoubleClick={(e) => handleCellDoubleClick(e, row, col)}
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
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, padding: 4 }}>
					{renderItem({ item, rowIdx: row, columnIdx: col })}
                    </View>
                </TableCell>} />

            </tr>} />

			{showEmptyLastRow === true && <tr
            style={StyleSheet.flatten([{ backgroundColor: data.length % 2 == 0 ? 'white' : '#F6F8FF' }, rowContainerStyle])}>

                {rowNumbers === true && <TableCell
                style={StyleSheet.flatten([{
                    padding: 4,
                    overflow: 'hidden',
                }, itemContainerStyle])} />}

                <List data={columns} renderItem={({ index: col }) => <TableCell
                onDoubleClick={(e) => handleCellDoubleClick(e, data.length, col)}
                style={StyleSheet.flatten([{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                }, itemContainerStyle])}>
					<Text style={{ fontFamily: 'monospace' }}>{' '}</Text>
                </TableCell>} />

            </tr>}

        </tbody>}
    </table>;
});

export default DataSheet;