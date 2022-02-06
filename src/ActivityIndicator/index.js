//
//  index.js
//
//  Copyright (c) 2021 - 2022 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const ActivityIndicatorContext = React.createContext(() => {});

export function useActivityIndicator() {
    
    const setVisible = React.useContext(ActivityIndicatorContext);

    return async (callback = async () => {}, delay = 500) => {

        try {

            let completed = false;
            setTimeout(() => { if (!completed) setVisible(true); }, delay);

            await callback();

            completed = true;
            setVisible(false);

        } catch (e) {

            completed = true;
            setVisible(false);

            throw e;
        }
    };
}

export const ActivityIndicatorProvider = React.forwardRef(({ 
    children,
    color = 'white',
    backdrop = true,
    backdropColor = 'rgba(0, 0, 0, 0.75)',
    passThroughEvents = false,
}, forwardRef) => {

    const [visible, setVisible] = React.useState(false);
    
    return <ActivityIndicatorContext.Provider ref={forwardRef} value={setVisible}>
        {children}
        {visible === true && <View
        pointerEvents={passThroughEvents ? 'none' : 'auto'}
        style={[{
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
        }, StyleSheet.absoluteFill]}>
            {backdrop === true ? <View style={{
                padding: 32,
                borderRadius: 8,
                backgroundColor: backdropColor,
            }}><ActivityIndicator color={color} /></View> : <ActivityIndicator color={color} />}
        </View>}
    </ActivityIndicatorContext.Provider>;
});
