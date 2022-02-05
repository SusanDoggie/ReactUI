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

import 'codemirror/lib/codemirror.css';
import './index.css';
import React from 'react';
import { View } from 'react-native';

export const CodeMirror = React.forwardRef(function({
	value,
	defaultValue,
	style,
	autoFocus,
	options,
	onChange,
	onCursorActivity,
	onFocus,
	onBlur,
	onScroll,
	...props
}, forwardRef) {

	const codeMirror = React.useRef({ editor: null });
	const textareaRef = React.useRef();

	React.useEffect(() => {

		const editor = require('codemirror').fromTextArea(textareaRef.current, options);
		codeMirror.current.editor = editor;
		
		editor.on('change', (editor, change) => onChange && change.origin !== 'setValue' && onChange(editor.getValue(), change));
		editor.on('cursorActivity', (editor) => onCursorActivity && onCursorActivity(editor));
		editor.on('focus', () => onFocus && onFocus());
		editor.on('blur', () => onBlur && onBlur());
		editor.on('scroll', (editor) => onScroll && onScroll(editor.getScrollInfo()));
		editor.setValue(value ?? defaultValue ?? '');

		return () => editor.toTextArea();

	}, []);

	React.useEffect(() => {

		const editor = codeMirror.current.editor;

		if (!_.isNil(editor) && !_.isNil(value) && editor.getValue() !== value) {
			editor.setValue(value);
		}

	}, [value]);

	React.useImperativeHandle(forwardRef, () => ({
		focus: () => { codeMirror.current.editor?.focus(); },
	}), []);

	return <View style={[{ width: '100%', height: '100%' }, style]} {...props}>
		<textarea
			ref={textareaRef}
			defaultValue={value ?? defaultValue ?? ''}
			autoComplete='off'
			autoFocus={autoFocus} />
	</View>;
});

export default CodeMirror;