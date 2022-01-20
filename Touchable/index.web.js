//
//  index.web.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
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

    }, [callback]);
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

    }, [onDrag]);

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

    }, [onDrop]);

    return <TouchableWithoutFeedback 
    ref={useMergeRefs(forwardRef, touchableRef)}
    {...props}>
        {children}
    </TouchableWithoutFeedback>;
});

export default Touchable;