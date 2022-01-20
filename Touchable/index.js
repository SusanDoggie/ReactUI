//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';

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
    return <TouchableWithoutFeedback ref={forwardRef} {...props}>{children}</TouchableWithoutFeedback>;
});

export default Touchable;