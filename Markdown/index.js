//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import Renderer from 'react-native-markdown-display';

export const Markdown = React.forwardRef(({
    source,
    style,
    contentStyle,
	...props
}, forwardRef) => {
    return <View ref={forwardRef} style={style}>
        <Renderer style={contentStyle} {...props}>{source?.content ?? ''}</Renderer>
    </View>;
});

export default Markdown;