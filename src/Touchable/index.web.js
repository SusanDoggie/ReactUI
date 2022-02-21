//
//  index.web.js
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
import { TouchableWithoutFeedback } from 'react-native';
import { NodeHandleProvider } from '../NodeHandleProvider';

const supportsPointerEvent = () => typeof window !== 'undefined' && window.PointerEvent != null;
const options = { passive: true };

function normalizeEvent(event) {
    event.nativeEvent = event;
    return event;
}

function registerEventListener(nodeHandle, event, callback) {

    React.useEffect(() => {

        const target = nodeHandle;
        if (!(target instanceof EventTarget)) return;

        const _callback = (e) => callback(normalizeEvent(e));
        if (_.isFunction(callback)) target.addEventListener(event, _callback, options);

        return () => {
            if (_.isFunction(callback)) target.removeEventListener(event, _callback, options)
        };

    }, [nodeHandle, event, callback]);
}

export const Touchable = React.forwardRef(({
    onDragStart,
    onDragEnd,
    onDrop,
    onDragIn,
    onDragOver,
    onDragOut,
    onHoverIn,
    onHoverOut,
    children,
    ...props
}, forwardRef) => {

    const [nodeHandle, setNodeHandle] = React.useState();

    const _supportsPointerEvent = supportsPointerEvent();
    registerEventListener(nodeHandle, 'dragend', onDragEnd);
    registerEventListener(nodeHandle, 'dragenter', onDragIn);
    registerEventListener(nodeHandle, 'dragover', onDragOver);
    registerEventListener(nodeHandle, 'dragleave', onDragOut);
    registerEventListener(nodeHandle, _supportsPointerEvent ? 'pointerover' : 'mouseover', onHoverIn);
    registerEventListener(nodeHandle, _supportsPointerEvent ? 'pointerout' : 'mouseout', onHoverOut);

    React.useEffect(() => {

        const target = nodeHandle;
        if (!(target instanceof EventTarget)) return;

        const originalDraggableValue = target.getAttribute('draggable');
        const _onDrag = (e) => onDragStart(normalizeEvent(e));

        if (_.isFunction(onDragStart)) {
            target.addEventListener('dragstart', _onDrag, options);
            target.setAttribute('draggable', 'true');
        }

        return () => {
            if (_.isFunction(onDragStart)) {
                target.removeEventListener('dragstart', _onDrag, options);
                if (_.isNil(originalDraggableValue)) {
                    target.removeAttribute('draggable');
                } else {
                    target.setAttribute('draggable', originalDraggableValue);
                }
            }
        }

    }, [nodeHandle, onDragStart]);

    React.useEffect(() => {

        const target = nodeHandle;
        if (!(target instanceof EventTarget)) return;

        const _onDrop = (e) => onDrop(normalizeEvent(e));
        const _onDropOver = (e) => e.preventDefault();

        if (_.isFunction(onDrop)) {
            target.addEventListener('drop', _onDrop, options);
            target.addEventListener('dragover', _onDropOver);
        }

        return () => {
            if (_.isFunction(onDrop)) {
                target.removeEventListener('drop', _onDrop, options);
                target.removeEventListener('dragover', _onDropOver);
            }
        }

    }, [nodeHandle, onDrop]);

    return <NodeHandleProvider onChangeHandle={setNodeHandle}>
        <TouchableWithoutFeedback ref={forwardRef} {...props}>{children}</TouchableWithoutFeedback>
    </NodeHandleProvider>;
});

export default Touchable;