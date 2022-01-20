//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { Image as RNImage } from 'react-native';
import ImageBase from './ImageBase';

export const Image = React.forwardRef(({
    source,
    style,
    ...props
}, forwardRef) => {

    const {
        width,
        height,
        ..._style
    } = style ?? {};

    const _source = RNImage.resolveAssetSource ? RNImage.resolveAssetSource(source) : undefined;
    const [imageSize, setImageSize] = React.useState({ width: _source?.width ?? 0, height: _source?.height ?? 0 });

    React.useEffect(() => { 
        if (_.isString(source?.uri)) {
            RNImage.getSize(source.uri, (width, height) => setImageSize({ width, height }));
        }
    }, [source?.uri]);

    let aspectRatio;
    let _width = width;
    let _height = height;
    
    if (imageSize.width && imageSize.height) {

        if (!_width && !_height) {
            _width = imageSize.width;
            _height = imageSize.height;
        } else if (!_width || !_height) {
            aspectRatio = imageSize.width / imageSize.height;
        }
    
        if (props.blurRadius > 0 && _.isNumber(_width)) {
            props.blurRadius = props.blurRadius * imageSize.width / _width;
        }    
    }
    
    return <ImageBase ref={forwardRef} source={source} style={{ width: _width, height: _height, aspectRatio, ..._style }} {...props} />;
});

export default Image;