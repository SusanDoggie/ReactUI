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
import { View } from 'react-native';
import { EditorState } from '@codemirror/state';
import { lineNumbers as _lineNumbers } from '@codemirror/view';
import { EditorView, keymap, highlightSpecialChars, drawSelection } from '@codemirror/view';
import { standardKeymap, history, historyKeymap } from '@codemirror/commands';
import { defaultHighlightStyle, syntaxHighlighting, codeFolding as _codeFolding, foldGutter as _foldGutter } from '@codemirror/language';
import { useMergeRefs, useCallbackRef } from 'sugax';

export const CodeMirror = React.forwardRef(function({
	value,
	defaultValue,
	autoFocus,
	onChange,
  onChangeValue,
	onFocus,
	onBlur,
	onSelectionChange,
  extensions = [],
  editable = true,
  codeFolding = false,
  lineNumbers = false,
  allowMultipleSelections = true,
  tabSize = 4,
  keymaps = [],
  ...props
}, forwardRef) {
  
	const codeMirror = React.useRef({ editor: null });
  const divRef = React.useRef();
  const ref = useMergeRefs(divRef, forwardRef);

  const onChangeRef = useCallbackRef(onChange);
  const onChangeValueRef = useCallbackRef(onChangeValue);
  const onFocusRef = useCallbackRef(onFocus);
  const onBlurRef = useCallbackRef(onBlur);
  const onSelectionChangeRef = useCallbackRef(onSelectionChange);

  React.useEffect(() => {

    if (_.isNil(divRef.current)) return;

    const editor = new EditorView({
      doc: value?.toString() ?? defaultValue?.toString(),
      parent: divRef.current,
      extensions: [
        highlightSpecialChars(),
        history(),
        drawSelection(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of(_.flattenDeep([standardKeymap, historyKeymap, keymaps])),
        lineNumbers && _lineNumbers(),
        codeFolding && _codeFolding(),
        codeFolding && _foldGutter(),
        EditorView.editable.of(editable),
        EditorState.allowMultipleSelections.of(allowMultipleSelections),
        EditorState.tabSize.of(tabSize),
        EditorView.updateListener.of((e) => {
          if (e.docChanged) {
            onChangeRef.current?.(e);
            onChangeValueRef.current?.(e.state.doc.toString());
          }
          if (e.focusChanged) {
            const callback = e.view.hasFocus ? onFocusRef : onBlurRef;
            callback.current?.(e);
          }
          if (e.selectionSet) {
            onSelectionChangeRef.current?.(e);
          }
        }),
        ...extensions
      ].filter(Boolean),
    });

    codeMirror.current.editor = editor;
    if (autoFocus) editor.focus();

    return () => editor.destroy();
  
  }, []);
  
  React.useEffect(() => {

    const editor = codeMirror.current.editor;
    if (_.isNil(editor) || _.isNil(value)) return;

    if (editor.state.doc.toString() !== value.toString()) {
      editor.dispatch(editor.state.update({ 
        changes: { 
          from: 0, 
          to: editor.state.doc.length, 
          insert: value 
        } 
      }));
    }
    
  }, [value]);
  
  return <View ref={ref} {...props} />;
});

export default CodeMirror;