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