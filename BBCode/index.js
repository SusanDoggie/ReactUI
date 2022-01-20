//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import HTML from '../HTML';
import { bbcode2html } from './parser';

export const BBCode = React.forwardRef(({
    source,
    ...props
}, forwardRef) => {
    const html = React.useMemo(() => _.isString(source?.content) ? bbcode2html(source.content) : '', [source?.content]);
    return <HTML ref={forwardRef} source={{ content: html }} {...props} />;
});

export default BBCode;