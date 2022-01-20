//
//  index.web.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';

export const SVG = React.forwardRef(({
    source,
    style,
	...props
}, forwardRef) => {

    const { 
        width,
        height,
        aspectRatio,
        ..._style
    } = style ?? {};

    if (_.isString(source?.content)) {
        return <View ref={forwardRef} style={{ width, height, aspectRatio, ..._style }} {...props}>
            <img
            draggable={false}
            width={_.isNil(width) && (_.isNil(height) || _.isNil(aspectRatio)) ? undefined : '100%'}
            height={_.isNil(height) && (_.isNil(width) || _.isNil(aspectRatio)) ? undefined : '100%'}
            src={`data:image/svg+xml,${encodeURIComponent(source.content)}`} />
        </View>;
    }

    if (_.isString(source?.uri)) {
        return <View ref={forwardRef} style={{ width, height, aspectRatio, ..._style }} {...props}>
            <img
            draggable={false}
            width={_.isNil(width) && (_.isNil(height) || _.isNil(aspectRatio)) ? undefined : '100%'}
            height={_.isNil(height) && (_.isNil(width) || _.isNil(aspectRatio)) ? undefined : '100%'}
            src={source.uri} />
        </View>;
    }

    return <View ref={forwardRef} style={{ width, height, aspectRatio, ..._style }} {...props} />;
});

export default SVG;