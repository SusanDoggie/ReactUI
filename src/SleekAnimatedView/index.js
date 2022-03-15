//
//  SleekAnimatedView.js
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

const BackgroundContainer = ({ images, style, imageStyle, frameIndex, resizeMode }) => <View style={style}>
    <List data={images} renderItem={({ item, index }) => <Image
        source={item}
        style={[{ width: '100%', height: '100%', display: index === frameIndex ? 'flex' : 'none' }, imageStyle]}
        resizeMode={resizeMode} />} />
</View>;

export const SleekAnimatedView = React.forwardRef(({
    backgroundContainerStyle,
    backgroundStyle,
    backgroundImages = [],
    resizeMode = 'cover',
    horizontal = false,
    children,
    ...props
}, forwardRef) => {

    const containerRef = React.useRef();
    const ref = useMergeRefs(containerRef, forwardRef);
    const [layout, setLayout] = React.useState({});
    const [frameIndex, setFrameIndex] = React.useState(0);

    const scrollViewRef = useScrollView();
    const scrollViewLayout = useScrollLayout();

    React.useEffect(() => {

        if (_.isNil(scrollViewRef.current)) return;
        if (_.isNil(containerRef.current)) return;
        if (_.isNil(scrollViewLayout?.layoutMeasurement)) return;

        containerRef.current.measureLayout(scrollViewRef.current, (left, top, width, height) => {

            const maxX = width - scrollViewLayout.layoutMeasurement.width;
            const maxY = height - scrollViewLayout.layoutMeasurement.height;
            const offsetX = Math.max(0, Math.min(maxX, -left));
            const offsetY = Math.max(0, Math.min(maxY, -top));

            const offsetMax = horizontal === true ? maxX : maxY;
            const offset = horizontal === true ? offsetX : offsetY;
            const frameIndex = Math.min(backgroundImages.length - 1, Math.floor((offset / offsetMax) * backgroundImages.length));
    
            setLayout({ left: offsetX, top: offsetY });
            setFrameIndex(frameIndex);
        });

    }, [scrollViewLayout]);

    return <View ref={ref} {...props}>
        <BackgroundContainer
        frameIndex={frameIndex}
        resizeMode={resizeMode}
        images={backgroundImages}
        imageStyle={backgroundStyle}
        style={[{
            position: 'absolute',
            ...layout,
            width: scrollViewLayout?.layoutMeasurement?.width,
            height: scrollViewLayout?.layoutMeasurement?.height,
            zIndex: -1,
        }, backgroundContainerStyle]} />
        {children}
    </View>;
});

export default SleekAnimatedView;