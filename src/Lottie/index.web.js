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
import { useMergeRefs } from 'sugax';
import { View, StyleSheet, Animated } from 'react-native';
import LottieWeb from 'lottie-web';

const LottieBase = React.forwardRef(({
    source,
    style,
    onLayout,
    duration = 0,
    autoPlay = false,
    loop = true,
    preserveAspectRatio,
    ...props
}, forwardRef) => {
    
    const handleRef = React.useRef();
    const containerRef = React.useRef();
    const ref = useMergeRefs(containerRef, forwardRef);
    const [layout, setLayout] = React.useState({});
    
    React.useImperativeHandle(forwardRef, () => ({
        get currentFrame() { return handleRef.current?.currentFrame },
        get totalFrames() { return handleRef.current?.totalFrames },
        get frameRate() { return handleRef.current?.frameRate },
        get playCount() { return handleRef.current?.playCount },
        get isPaused() { return handleRef.current?.isPaused },
        get duration() { return handleRef.current?.getDuration(false) },
    }));

    const _style = StyleSheet.flatten(style) ?? {};

    let aspectRatio;
    let _width = _style.width;
    let _height = _style.height;
    
    if (!_.isNil(source)) {
        if (!_.isNil(_width) && !_.isNil(_height)) {
            _width = source.w;
            _height = source.h;
        } else if (!_.isNil(_width) || !_.isNil(_height)) {
            aspectRatio = source.w / source.h;
        }
    }
    
    React.useEffect(() => {

        const handle = LottieWeb.loadAnimation({
            container: containerRef.current,
            animationData: source,
            renderer: 'canvas',
            rendererSettings: { preserveAspectRatio },
            autoplay: autoPlay,
            loop,
        });

        handleRef.current = handle;

        return () => handle.destroy();

    }, [source]);
    
    React.useEffect(() => {
        
        const handle = handleRef.current;
        if (_.isNil(handle) || !handle.isPaused) return;
        
        handle.goToAndStop(Math.max(0, Math.min(1, duration)) * handle.getDuration(false) * 1000, false);
        
    }, [duration]);
    
    React.useEffect(() => { handleRef.current?.resize(); }, [layout.width, layout.height]);
    
    return <View
    ref={ref}
    onLayout={(event) => {
        setLayout(event.nativeEvent.layout);
        if (_.isFunction(onLayout)) onLayout(event);
    }}
    style={[{ aspectRatio, width: _width, height: _height }, style]}
    {...props} />;
});

export const Lottie = Animated.createAnimatedComponent(LottieBase);

export default Lottie;
