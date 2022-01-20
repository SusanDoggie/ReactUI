//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { View, Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

function render_html(contentWidth, source, props) {

    if (_.isString(source?.content)) {
        return <RenderHtml contentWidth={contentWidth} source={{ html: source.content }} {...props} />;
    }

    if (_.isString(source?.uri)) {
        return <RenderHtml contentWidth={contentWidth} source={source} {...props} />;
    }
}

export const HTML = React.forwardRef(({
    source,
    style,
	...props
}, forwardRef) => {

    const [contentWidth, setContentWidth] = React.useState(Dimensions.get('window').width);

    return <View ref={forwardRef} style={style} onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}>
        {render_html(contentWidth, source, props)}
    </View>;
});

export default HTML;