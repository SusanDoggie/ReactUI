//
//  ImageBase.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

export const ImageBase = React.forwardRef((props, forwardRef) => {

    if (props.style?.width && props.style?.height) {
        return props.blurRadius > 0 ? <Image ref={forwardRef} {...props} /> : <FastImage ref={forwardRef} {...props} />;
    }
    return <Image ref={forwardRef} {...props} />;
});

export default ImageBase;