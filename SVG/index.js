//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgCss, SvgCssUri } from 'react-native-svg';

export const SVG = React.forwardRef(({
    source,
    style,
	...props
}, forwardRef) => {

    const { 
        width,
        height,
        ..._style
    } = StyleSheet.flatten(style);

    if (_.isString(source?.content)) {
        return <SvgCss ref={forwardRef} width={width} height={height} xml={source.content} style={_style} {...props} />;
    }

    if (_.isString(source?.uri)) {
        return <SvgCssUri ref={forwardRef} width={width} height={height} uri={source.uri} style={_style} {...props} />;
    }

    return <View ref={forwardRef} style={{ width, height, ..._style }} {...props} />
});

export default SVG;