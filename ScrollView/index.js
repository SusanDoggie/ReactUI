//
//  index.ios.js
//
//  Copyright (c) 2021 - 2022 The Oddmen Technology Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { RefreshControl } from 'react-native';
import ScrollViewBase from './ScrollViewBase';

async function _onRefresh(onRefresh, setRefreshing) {
  setRefreshing(true);
  try { await onRefresh() } catch { }
  setRefreshing(false);
}

export const ScrollView = React.forwardRef(({ children, onRefresh, refreshControlProps, ...props }, forwardRef) => {

  const [refreshing, setRefreshing] = React.useState(false);

  let refreshControl;
  if (onRefresh) {
    refreshControl = <RefreshControl
      refreshing={refreshing}
      onRefresh={() => _onRefresh(onRefresh, setRefreshing)} 
      {...refreshControlProps} />;
  }

  return <ScrollViewBase ref={forwardRef} refreshControl={refreshControl} {...props}>{children}</ScrollViewBase>;
});

export default ScrollView;