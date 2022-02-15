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
import { Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from '../Icon';

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

	const [isHover, setIsHover] = React.useState(false);

	const _style = isHover ? StyleSheet.compose(style, hoverStyle) : style;
	const _iconStyle = isHover ? StyleSheet.compose(iconStyle, iconHoverStyle) : iconStyle;
	const _titleStyle = isHover ? StyleSheet.compose(titleStyle, titleHoverStyle) : titleStyle;

	let content = children;

	if (_.isEmpty(children)) {
		if (!_.isEmpty(icon) && !_.isEmpty(title)) {
			content = <Icon icon={icon} name={iconName} style={[{ color: 'white', fontWeight: '500' }, _titleStyle]} iconStyle={_iconStyle}> {title}</Icon>;
		} else if (!_.isEmpty(icon)) {
			content = <Icon icon={icon} name={iconName} iconStyle={[{ color: 'white', fontWeight: '500' }, _iconStyle]} />;
		} else if (!_.isEmpty(title)) {
			content = <Text style={[{ color: 'white', fontWeight: '500' }, _titleStyle]}>{title}</Text>;
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
	style={[{
		padding: 8,
		borderRadius: 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: disabled ? '#dfdfdf' : isHover ? '#1691E8' : '#2196F3',
		userSelect: 'none',
	}, _style]} {...props}>
		{content}
	</Pressable>;
});

export default Button;