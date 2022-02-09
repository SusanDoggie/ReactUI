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
import { useMergeRefs } from 'sugax';

const supportsPointerEvent = () => typeof window !== 'undefined' && window.PointerEvent != null;
const options = { passive: true };

function normalizeEvent(event) {
    event.nativeEvent = event;
    return event;
}

function registerEventListener(targetRef, event, callback) {

    React.useLayoutEffect(() => {

        const target = targetRef.current;
        if (_.isNil(target)) return;

        const _callback = (e) => callback(normalizeEvent(e));
        if (_.isFunction(callback)) target.addEventListener(event, _callback, options);

        return () => {
            if (_.isFunction(callback)) target.removeEventListener(event, _callback, options)
        };

    }, [targetRef.current, event, callback]);
}

export const Touchable = React.forwardRef(({
    onDrag,
    onDrop,
    onDragIn,
    onDragOver,
    onDragOut,
    onHoverIn,
    onHoverOut,
    children,
    ...props
}, forwardRef) => {

    const touchableRef = React.useRef();

    const _supportsPointerEvent = supportsPointerEvent();
    registerEventListener(touchableRef, 'dragenter', onDragIn);
    registerEventListener(touchableRef, 'dragover', onDragOver);
    registerEventListener(touchableRef, 'dragleave', onDragOut);
    registerEventListener(touchableRef, _supportsPointerEvent ? 'pointerover' : 'mouseover', onHoverIn);
    registerEventListener(touchableRef, _supportsPointerEvent ? 'pointerout' : 'mouseout', onHoverOut);

    React.useLayoutEffect(() => {

        const target = touchableRef.current;
        if (_.isNil(target)) return;

        const originalDraggableValue = target.getAttribute('draggable');
        const _onDrag = (e) => onDrag(normalizeEvent(e));

        if (_.isFunction(onDrag)) {
            target.addEventListener('dragstart', _onDrag, options);
            target.setAttribute('draggable', 'true');
        }

        return () => {
            if (_.isFunction(onDrag)) {
                target.removeEventListener('dragstart', _onDrag, options);
                if (_.isNil(originalDraggableValue)) {
                    target.removeAttribute('draggable');
                } else {
                    target.setAttribute('draggable', originalDraggableValue);
                }
            }
        }

    }, [touchableRef.current, onDrag]);

    React.useLayoutEffect(() => {

        const target = touchableRef.current;
        if (_.isNil(target)) return;

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

    }, [touchableRef.current, onDrop]);

    return <TouchableWithoutFeedback 
    ref={useMergeRefs(forwardRef, touchableRef)}
    {...props}>
        {children}
    </TouchableWithoutFeedback>;
});

export default Touchable;