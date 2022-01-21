//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Icons from '../Icons';

export const Icon = React.forwardRef(({
	icon,
	name,
	style,
	children,
	...props
}, forwardRef) => {

	const _Icon = Icons[icon];

	const {
		fontSize,
		color,
		..._style
	} = StyleSheet.flatten(style);
	
	return <Text ref={forwardRef} style={style} {...props}>
		{!_.isNil(_Icon) && <_Icon name={name} size={fontSize} color={color} style={_style} />}
		{children}
	</Text>;
});

export default Icon;