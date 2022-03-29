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
import Svg, { Rect } from 'react-native-svg';
import qrcode from 'qrcode';

export const QRCode = React.forwardRef(({
    value = '',
    options = {},
    color = 'black',
    backgroundColor,
    ...props
}, forwardRef) => {

    let path = '';
    let _size = 100;
    
    try {

        const { size, data } = qrcode.create(value, options).modules;
        _size = size;

        for (let i = 0; i < data.length; i++) {

            if (data[i]) {
                const col = Math.floor(i % size);
                const row = Math.floor(i / size);
                path += `M${col},${row}v1h1v-1z`
            }
        }

    } catch { }

    return <Svg ref={forwardRef} viewBox={`0 0 ${_size} ${_size}`} preserveAspectRatio='none' {...props}>
        {backgroundColor && <Rect x={0} y={0} width={_size} height={_size} fill={backgroundColor} />}
        <Path d={path} fill={color} />
    </Svg>;
});

export default QRCode;
