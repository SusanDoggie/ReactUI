//
//  index.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React, { useState } from 'react';
import { Text, Pressable } from 'react-native';
import * as Icons from '../Icons';

export const Button = React.forwardRef(({
	icon,
	iconName,
	iconStyle,
	iconHoverStyle,
	title,
	style,
	hoverStyle,
	titleStyle,
	titleHoverStyle,
	onHoverIn,
	onHoverOut,
	disabled,
	focusable,
	children,
	...props
}, forwardRef) => {

	const [isHover, setIsHover] = useState(false);

	const _style = isHover ? { ...style, ...hoverStyle } : { ...style };
	const _iconStyle = isHover ? { ...iconStyle, ...iconHoverStyle } : { ...iconStyle };
	const _titleStyle = isHover ? { ...titleStyle, ...titleHoverStyle } : { ...titleStyle };

	const Icon = Icons[icon];

	let content = children;

	if (_.isEmpty(children)) {
		if (!_.isEmpty(Icon) && !_.isEmpty(title)) {
			content = <Text style={{ color: 'white', fontWeight: '500', ..._titleStyle }}><Icon name={iconName} {..._iconStyle} /> {title}</Text>;
		} else if (!_.isEmpty(Icon)) {
			content = <Icon name={iconName} color='white' fontWeight='500' {..._iconStyle} />;
		} else if (!_.isEmpty(title)) {
			content = <Text style={{ color: 'white', fontWeight: '500', ..._titleStyle }}>{title}</Text>;
		}
	}

	return <Pressable
	ref={forwardRef}
	onHoverIn={(e) => {
		setIsHover(true);
		if (onHoverIn) onHoverIn(e);
	}}
	onHoverOut={(e) => {
		setIsHover(false);
		if (onHoverOut) onHoverOut(e);
	}}
	disabled={disabled}
	focusable={!disabled && focusable !== false}
	style={{
		padding: 8,
		borderRadius: 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: disabled ? '#dfdfdf' : isHover ? '#1691E8' : '#2196F3',
		userSelect: 'none',
		..._style
	}} {...props}>
		{content}
	</Pressable>;
});

export default Button;