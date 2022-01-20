//
//  ScrollViewBase.ios.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { ScrollView, UIManager, Keyboard, TextInput, findNodeHandle } from 'react-native';

export const KeyboardAwareScrollView = React.forwardRef(({ children, onScroll, scrollEventThrottle, ...props }, forwardRef) => {

  const scrollViewRef = React.useRef();
  const scrollEvent = React.useRef({});
  
  React.useImperativeHandle(forwardRef, () => ({
    flashScrollIndicators: () => scrollViewRef.current.flashScrollIndicators(...arguments),
    scrollTo: () => scrollViewRef.current.scrollTo(...arguments),
    scrollToEnd: () => scrollViewRef.current.scrollToEnd(...arguments),
  }));
  
  React.useEffect(() => {

    const event = Keyboard.addListener('keyboardWillShow', (event) => {
    
      const currentlyFocusedInput = TextInput.State.currentlyFocusedInput();
      const scrollResponder = scrollViewRef.current.getScrollResponder();
      const innerViewNode = scrollResponder.getInnerViewNode();
  
      UIManager.viewIsDescendantOf(findNodeHandle(currentlyFocusedInput), innerViewNode, (isAncestor) => {
        
        if (isAncestor) {
          
          currentlyFocusedInput.measureInWindow((_x, y, _width, height) => {
  
            const maxY = y + height;
            const contentOffsetY = scrollEvent.current.contentOffset?.y ?? 0;
  
            if (maxY > event.endCoordinates.screenY) {
  
              scrollViewRef.current.scrollTo({ y: contentOffsetY + maxY - event.endCoordinates.screenY });
            }
          });
        }
      });
    });

    return () => event.remove();
    
  }, []);

  return <ScrollView
    ref={scrollViewRef}
    onScroll={(event) => {
      _.assignIn(scrollEvent.current, event.nativeEvent);
      onScroll?.(event);
    }}
    scrollEventThrottle={scrollEventThrottle ?? 16}
    {...props}>{children}</ScrollView>;
});

export default KeyboardAwareScrollView;
