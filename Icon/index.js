//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { Text } from 'react-native';
import * as Icons from '../Icons';

export const Icon = React.forwardRef(({
	icon,
	name,
	style,
	...props
}, forwardRef) => {

	const _Icon = Icons[icon];
	
	return <Text ref={forwardRef} style={style} {...props}>
		{!_.isNil(_Icon) && <_Icon name={name} />}
	</Text>;
});

export default Icon;