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
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';

export { 
    useHref,
    useLocation,
    useMatch,
    useNavigate,
    useParams,
    useResolvedPath,
    useLinkClickHandler,
    Link,
    NavLink,
} from 'react-router-dom';

const NavigatorContext = React.createContext();

export const BrowserNavigator = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;
export const StaticNavigator = ({ location, context, children }) => <NavigatorContext.Provider value={context}>
    <StaticRouter location={location}>{children}</StaticRouter>
</NavigatorContext.Provider>;

export const useNavigatorContext = () => React.useContext(NavigatorContext);

function invariant(cond, message) {
    if (!cond) throw new Error(message);
}

export const Screen = () => invariant(
  false,
  `A <Screen> is only ever to be used as the child of <Navigator> element, ` +
  `never rendered directly. Please wrap your <Screen> in a <Navigator>.`
);

function createScreensFromChildren(children) {

    const screens = [];
  
    React.Children.forEach(children, element => {

        if (!React.isValidElement(element)) return;
    
        if (element.type === React.Fragment) {
            screens.push(createScreensFromChildren(element.props.children));
            return;
        }
        
        invariant(
            element.type === Screen,
            `[${typeof element.type === 'string' ? element.type : element.type.name}] ` +
            `is not a <Screen> component. All component children of <Navigator> must be a <Screen> or <React.Fragment>`
        );
        
        const screen = { ...element.props };
        
        if (element.props.children) {
            screen.children = createScreensFromChildren(element.props.children);
        }
    
        screens.push(screen);
    });

    return _.flattenDeep(screens);
}

function ScreenObject({ component: Component, statusCode, title, meta = {}, ...props }) {

    const NavigatorContext = useNavigatorContext();

    if (NavigatorContext) {
        for (const [key, value] of Object.entries(props)) {
            NavigatorContext[key] = value;
        }
        NavigatorContext.statusCode = statusCode;
        NavigatorContext.title = title;
        NavigatorContext.meta = meta;
    }
    
    if (global.document && _.isString(title)) {
        document.title = title;
    }
    
    return <Component {...props} />;
}

function routesBuilder(screens) {
    
    const routes = [];

    for (const screen of screens) {

        const { 
            caseSensitive,
            component,
            path,
            index,
            children = [],
            ...props
        } = screen;
        
        routes.push({
            element: <ScreenObject component={component} {...props} />,
            caseSensitive,
            path,
            index,
            children: routesBuilder(children),
        });
    }
    
    return routes;
}

export const Navigator = ({ children }) => useRoutes(routesBuilder(createScreensFromChildren(children)));
