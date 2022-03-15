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
import { View, Image } from 'react-native';
import { useScrollView, useScrollLayout } from '../ScrollView';
import { List } from '../List';
import { useMergeRefs } from 'sugax';

function StickyContainer({
    layout,
    scrollViewLayout,
    style,
    horizontal,
    renderItem,
}) {

    const left = layout.left ?? 0;
    const top = layout.top ?? 0;
    const width = layout.width ?? 0;
    const height = layout.height ?? 0;

    const maxX = width - (scrollViewLayout.layoutMeasurement?.width ?? 0);
    const maxY = height - (scrollViewLayout.layoutMeasurement?.height ?? 0);

    const offsetX = Math.max(0, Math.min(maxX, left + (scrollViewLayout.contentOffset?.x ?? 0)));
    const offsetY = Math.max(0, Math.min(maxY, top + (scrollViewLayout.contentOffset?.y ?? 0)));

    const offsetMax = horizontal === true ? maxX : maxY;
    const offset = horizontal === true ? offsetX : offsetY;

    return <View style={[{
        position: 'absolute',
        left: offsetX, 
        top: offsetY,
        width: scrollViewLayout.layoutMeasurement?.width,
        height: scrollViewLayout.layoutMeasurement?.height,
    }, style]}>
        {renderItem({ offset: offset / offsetMax })}
    </View>;
}

export const StickyView = React.forwardRef(({
    onLayout,
    stickyContainerStyle,
    horizontal = false,
    stickyView,
    children,
    ...props
}, forwardRef) => {

    const containerRef = React.useRef();
    const ref = useMergeRefs(containerRef, forwardRef);
    const [layout, setLayout] = React.useState({});

    const scrollViewRef = useScrollView();
    const scrollViewLayout = useScrollLayout();

    function _setLayout({ width, height }) {
        
        if (_.isNil(scrollViewRef.current)) return;
        if (_.isNil(containerRef.current)) return;
        
        containerRef.current.measureLayout(scrollViewRef.current, (left, top) => {
            const offset_x = scrollViewLayout.contentOffset?.x ?? 0;
            const offset_y = scrollViewLayout.contentOffset?.y ?? 0;
            setLayout({ left: -left - offset_x, top: -top - offset_y, width, height });
        });
    }
    
    return <View
    ref={ref}
    onLayout={(event) => {
        _setLayout(event.nativeEvent.layout);
        if (_.isFunction(onLayout)) onLayout(event);
    }} {...props}>
        {_.isFunction(stickyView) && <StickyContainer
            layout={layout}
            scrollViewLayout={scrollViewLayout}
            horizontal={horizontal}
            style={stickyContainerStyle}
            renderItem={stickyView} />}
        {children}
    </View>;
});

export default StickyView;