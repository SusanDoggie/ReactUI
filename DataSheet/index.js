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
import { EJSON } from 'bson';
import { View, Text } from 'react-native';
import { List } from '../List';
import { useElementLayout, useDocumentEvent, useMergeRefs } from 'sugax';
import { ValueViewer } from './ValueViewer';
import { _encode_value } from './_encode_value';

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

    const _style = selected ? selectedStyle : style;

    return <td ref={ref} style={{
        border: 1,
        borderStyle: selected ? 'double' : 'solid',
        borderColor: selected ? '#2185D0' : '#DDD',
        boxShadow: selected ? `inset 0 -${cellHeight}px 0 ${highlightColor}` : null,
        ..._style
    }} {...props}>{children}</td>;
}

export const DataSheet = React.forwardRef(({
    data,
    columns,
    rowNumbers = true,
    renderItem = ({item}) => <ValueViewer value={item} />,
    style,
    headerContainerStyle,
    headerItemContainerStyle,
    headerTextStyle,
    rowContainerStyle,
    itemContainerStyle,
    selectedItemContainerStyle,
    contentContainerStyle,
    encodeValue,
    onDeleteRows,
    onDeleteCells,
    onCopyRows,
    onCopyCells,
    onPasteRows,
    onPasteCells,
    highlightColor = 'rgba(33, 133, 208, 0.15)',
    ...props
}, forwardRef) => {

    const tableRef = React.useRef();

    const ref = useMergeRefs(tableRef, forwardRef);

    const [state, _setState] = React.useState({
        selecting_rows: null,
        selected_rows: [],
        selecting_cells: null,
        selected_cells: null,
        shiftKey: false,
        metaKey: false,
    });

    const setState = (next) => _setState(state => ({ ...state, ...next }));

    React.useImperativeHandle(forwardRef, () => ({
        clearSelection: () => setState({ selecting_rows: null, selected_rows: [], selecting_cells: null, selected_cells: null }),
    }));

	function _current_selected_rows(e) {

		if (_.isEmpty(state.selecting_rows)) {
			return state.selected_rows;
		}

		const min_row = Math.min(state.selecting_rows.start_row, state.selecting_rows.end_row);
		const max_row = Math.max(state.selecting_rows.start_row, state.selecting_rows.end_row);

		if (e.shiftKey) {

			const selecting_rows = new Set(state.selected_rows);

			for (let row = min_row; row <= max_row; row++) {
				selecting_rows.add(row);
			}
	
			return [...selecting_rows].sort();
		} 
		
		if (e.metaKey) {

			const selecting_rows = new Set(state.selected_rows);

			for (let row = min_row; row <= max_row; row++) {
				if (selecting_rows.has(row)) {
					selecting_rows.delete(row);
				} else {
					selecting_rows.add(row);
				}
			}
	
			return [...selecting_rows].sort();
		} 

		const selecting_rows = new Set();

		for (let row = min_row; row <= max_row; row++) {
			selecting_rows.add(row);
		}
	
		return [...selecting_rows].sort();
	}
	
	function _encodeData(value) {
        const string = _.isFunction(encodeValue) ? encodeValue(value) : `${_encode_value(value)}`;
		return string.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r');
	}

	function onMouseDown(e) {

		if (!_.isEmpty(state.selected_rows) || !_.isEmpty(state.selected_cells)) {

			let node = e.target;

			while (node !== document) {
				if (node === tableRef.current) {
					return;
				}
				node = node.parentNode;
			}

			setState({ selecting_rows: null, selected_rows: [], selecting_cells: null, selected_cells: null });
		}
	}

	function onMouseUp(e) {

		if (!_.isEmpty(state.selecting_rows)) {

			const selected_rows = _current_selected_rows(e);
		
			setState({ selecting_rows: null, selected_rows, selected_cells: null });
		}

		if (!_.isEmpty(state.selecting_cells)) {

			setState({ selecting_cells: null, selected_cells: state.selecting_cells, selected_rows: [] });
		}
	}
  
	function handleRowMouseDown(e, row) {

		setState({ selecting_rows: { start_row: row, end_row: row }, shiftKey: e.shiftKey, metaKey: e.metaKey });
	}
  
	function handleRowMouseOver(e, row) {

		if (_.isEmpty(state.selecting_rows)) return;

		setState({ selecting_rows: { ...state.selecting_rows, end_row: row }, shiftKey: e.shiftKey, metaKey: e.metaKey });
	}
  
	function handleCellMouseDown(e, row, col) {

		setState({ selecting_cells: { start_row: row, start_col: col, end_row: row, end_col: col } });
	}
    
	function handleCellMouseOver(e, row, col) {

		if (_.isEmpty(state.selecting_cells)) return;

		setState({ selecting_cells: { ...state.selecting_cells, end_row: row, end_col: col } });
	}
  
	function handleCellDoubleClick(e, row, col) {
		console.log(e);
	}

	function handleKey(e) {

		if (e.ctrlKey) {
			if (e.keyCode === 67) {
			  handleCopy(e);
			} else if (e.keyCode === 86 || e.which === 86) {
			  handlePaste(e);
			}
		}

		if (e.keyCode === 8 || e.keyCode === 46) {
			handleDelete(e);
		}
	}

	function handleDelete(e) {

		if (!_.isEmpty(state.selected_rows)) {

			e.preventDefault();
			
			if (_.isFunction(onDeleteRows)) {
				onDeleteRows(state.selected_rows.sort());
			}
		}

		if (!_.isEmpty(state.selected_cells)) {

			e.preventDefault();
			
			if (_.isFunction(onDeleteCells)) {
				onDeleteCells(state.selected_cells);
			}
		}
	}

	function handleCopy(e) {

		if (!_.isEmpty(state.selected_rows)) {

			e.preventDefault();
			
			const selected_rows = state.selected_rows.sort();
			const _data = _.map(selected_rows, row => _.pick(data[row], columns));
			
			if (_.isFunction(onCopyRows)) {

				onCopyRows(selected_rows, _data);

			} else {

				e.clipboardData.setData('application/json', EJSON.stringify(_data));
				
				const text = _data.map(x => _.values(x).map(x => _encodeData(x)).join('\t')).join('\n');
				e.clipboardData.setData('text/plain', text);
			}
		}

		if (!_.isEmpty(state.selected_cells)) {

			e.preventDefault();
			
			const { start_row, start_col, end_row, end_col } = state.selected_cells;

			const min_row = Math.min(start_row, end_row);
			const max_row = Math.max(start_row, end_row);
			const min_col = Math.min(start_col, end_col);
			const max_col = Math.max(start_col, end_col);
	
			const _rows = _.range(min_row, max_row + 1);
			const _cols = _.range(min_col, max_col + 1);
			const _data = _.map(_rows, row => _.pick(data[row], _.map(_cols, col => columns[col])));

			if (_.isFunction(onCopyCells)) {

				onCopyCells({ start_row, start_col, end_row, end_col }, _data);

			} else {
				
				e.clipboardData.setData('application/json', EJSON.stringify(_data));
				
				const text = _data.map(x => _.values(x).map(x => _encodeData(x)).join('\t')).join('\n');
				e.clipboardData.setData('text/plain', text);
			}
		}
	}

	function handlePaste(e) {

		if (!_.isEmpty(state.selected_rows)) {

			e.preventDefault();
			
			if (_.isFunction(onPasteRows)) {
				onPasteRows(state.selected_rows.sort());
			}
		}

		if (!_.isEmpty(state.selected_cells)) {

			e.preventDefault();
			
			if (_.isFunction(onPasteCells)) {
				onPasteCells(state.selected_cells);
			}
		}
	}
    
    useDocumentEvent('mousedown', onMouseDown);
    useDocumentEvent('mouseup', onMouseUp);
    useDocumentEvent('keydown', handleKey);
    useDocumentEvent('copy', handleCopy);
    useDocumentEvent('paste', handlePaste);

    const _selected_rows = _.isEmpty(state.selecting_cells) ? _current_selected_rows(state) : [];
    const _selected_cells = _.isEmpty(state.selecting_rows) ? state.selecting_cells ?? state.selected_cells : null;
    
    const { start_row, start_col, end_row, end_col } = _selected_cells ?? {};
    const min_row = _.isEmpty(_selected_cells) ? null : Math.min(start_row, end_row);
    const max_row = _.isEmpty(_selected_cells) ? null : Math.max(start_row, end_row);
    const min_col = _.isEmpty(_selected_cells) ? null : Math.min(start_col, end_col);
    const max_col = _.isEmpty(_selected_cells) ? null : Math.max(start_col, end_col);

    const is_row_selected = (row) => _selected_rows.includes(row);
    const is_cell_selected = (row, col) => !_.isEmpty(_selected_cells) && min_row <= row && row <= max_row && min_col <= col && col <= max_col;

    return <table
    ref={ref}
    style={{ 
        borderCollapse: 'collapse',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        ...style,
    }} {...props}>
        <thead
        style={{
            position: 'sticky',
            tableLayout: 'fixed',
            top: 0,
            zIndex: 100,
            ...headerContainerStyle,
        }}>
            <tr style={{ backgroundColor: '#F6F8FF' }}>
            {rowNumbers === true && <th />}
            <List data={columns} renderItem={({ item }) => <th
            style={{
                padding: 0,
                position: 'relative', 
                border: 1, 
                borderStyle: 'solid',
                borderColor: '#DDD',
                ...headerItemContainerStyle
            }}><Text style={{ ...headerTextStyle }}>{item}</Text></th>} />
            </tr>
        </thead>

        {_.isArray(data) && <tbody
        style={{
            backgroundColor: 'white',
            ...contentContainerStyle,
        }}>
            <List data={data} renderItem={({ item: items, index: row }) => <tr
            style={{ 
                backgroundColor: row % 2 == 0 ? 'white' : '#F6F8FF',
                ...rowContainerStyle,
            }}>
                {rowNumbers === true && <TableCell
                selected={is_row_selected(row)}
                onMouseDown={(e) => handleRowMouseDown(e, row)}
                onMouseOver={(e) => handleRowMouseOver(e, row)}
                highlightColor={highlightColor}
                style={{
                    padding: 4,
                    overflow: 'hidden',
                    ...itemContainerStyle
                }}
                selectedStyle={{
                    padding: 4,
                    overflow: 'hidden',
                    ...selectedItemContainerStyle
                }}>
                    <Text style={{ fontFamily: 'monospace' }}>{row + 1}</Text>
                </TableCell>}

                <List data={_.map(columns, col => items[col])} renderItem={({ item, index: col }) => <TableCell 
                selected={is_row_selected(row) || is_cell_selected(row, col)}
                onMouseDown={(e) => handleCellMouseDown(e, row, col)}
                onMouseOver={(e) => handleCellMouseOver(e, row, col)}
                onDoubleClick={(e) => handleCellDoubleClick(e, row, col)}
                highlightColor={highlightColor}
                style={{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                    ...itemContainerStyle
                }}
                selectedStyle={{
                    padding: 0,
                    position: 'relative',
                    cursor: 'cell',
                    ...selectedItemContainerStyle
                }}>
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                        <View style={{ padding: 4 }}>{renderItem({ item, rowIdx: row, columnIdx: col })}</View>
                    </View>
                </TableCell>} />
            </tr>} />
        </tbody>}
    </table>;
});

export default DataSheet;