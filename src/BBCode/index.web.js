//
//  index.web.js
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
import { View } from 'react-native';
import { parse } from './parser';

function BBCodeBody({ elements, params }) {

    const result = [];
    
    for (const element of elements) {
  
        if (element.type === 'text') {
    
            let flag = false;
            for (const slice of element.text.split(/\r\n|\r|\n/g)) {
                if (flag) result.push(<br />);
                result.push(slice);
                flag = true;
            }
  
        } else if (element.type === 'tag') {
    
            switch (element.tag) {
      
                case 'b':
        
                    result.push(<strong><BBCodeBody elements={element.elements} params={params} /></strong>);
                    break;
        
                case 'i':
        
                    result.push(<i><BBCodeBody elements={element.elements} params={params} /></i>);
                    break;
        
                case 'u':
        
                    result.push(<u><BBCodeBody elements={element.elements} params={params} /></u>);
                    break;
        
                case 's':
        
                    result.push(<strike><BBCodeBody elements={element.elements} params={params} /></strike>);
                    break;
        
                case 'sub':
        
                    result.push(<sub><BBCodeBody elements={element.elements} params={params} /></sub>);
                    break;
        
                case 'sup':
        
                    result.push(<sup><BBCodeBody elements={element.elements} params={params} /></sup>);
                    break;
                  
                case 'color':
        
                    result.push(<span style={{ color: element.attrs.color }}><BBCodeBody elements={element.elements} params={params} /></span>);
                    break;
                  
                case 'size':
        
                    let font_size;
          
                    if (element.attrs.size) {
                        if (/^\d+$/.exec(element.attrs.size)) {
                            font_size = `${element.attrs.size}px`;
                        } else {
                            font_size = element.attrs.size;
                        }
                    }
          
                    result.push(<span style={{ fontSize: font_size }}><BBCodeBody elements={element.elements} params={params} /></span>);
                    break;
                  
                case 'font':
        
                    result.push(<span style={{ fontFamily: element.attrs.font }}><BBCodeBody elements={element.elements} params={params} /></span>);
                    break;
                  
                case 'left':
        
                    result.push(<div style={{ textAlign: 'left' }}><BBCodeBody elements={element.elements} params={params} /></div>);
                    break;
                
                case 'center':
        
                    result.push(<div style={{ textAlign: 'center' }}><BBCodeBody elements={element.elements} params={params} /></div>);
                    break;
                
                case 'right':
        
                    result.push(<div style={{ textAlign: 'right' }}><BBCodeBody elements={element.elements} params={params} /></div>);
                    break;
                
                case 'justify':
        
                    result.push(<div style={{ textAlign: 'justify' }}><BBCodeBody elements={element.elements} params={params} /></div>);
                    break;
                
                case 'ul':
        
                    result.push(<ul style={{ margin: 0 }}><BBCodeBody elements={element.elements} params={params} /></ul>);
                    break;
                  
                case 'ol':
        
                    result.push(<ol style={{ margin: 0 }}><BBCodeBody elements={element.elements} params={params} /></ol>);
                    break;
                  
                case 'li':
        
                    result.push(<li><BBCodeBody elements={element.elements} params={params} /></li>);
                    break;
                  
                case 'table':
        
                    const table_style = {
                        borderCollapse: 'collapse'
                    };
          
                    result.push(<table style={table_style}><BBCodeBody elements={element.elements} params={params} /></table>);
                    break;
                  
                case 'tr':
        
                    result.push(<tr><BBCodeBody elements={element.elements} params={params} /></tr>);
                    break;
                  
                case 'td':
                  
                    const td_style  = {
                      'border': '1px solid gray',
                    };
          
                    result.push(<td style={td_style}><BBCodeBody elements={element.elements} params={params} /></td>);
                    break;
                  
                case 'hr':
        
                    result.push(<hr />);
                    break;
                  
                case 'url':
        
                    result.push(<a href={element.attrs.url}><BBCodeBody elements={element.elements} params={params} /></a>);
                    break;
                
                case 'img':
        
                    let image_style = {};
          
                    if (element.attrs.img) {
                        const match = /(\d+)x(\d+)/.exec(element.attrs.img);
                        if (match) {
                            image_style.width = `${match[1]}px`;
                            image_style.height = `${match[1]}px`;
                        }
                    } else {
                        if (element.attrs.width) {
                            if (/^\d+$/.exec(element.attrs.width)) {
                                image_style.width = `${element.attrs.width}px`;
                            } else {
                                image_style.width = `${element.attrs.width}`;
                            }
                        }
                        if (element.attrs.height) {
                            if (/^\d+$/.exec(element.attrs.height)) {
                                image_style.height = `${element.attrs.height}px`;
                            } else {
                                image_style.height = `${element.attrs.height}`;
                            }
                        }
                    }
          
                    let image_src;
                    if (element.elements.length === 1 && element.elements[0].type === 'text') {
                      image_src = element.elements[0].text;
                    }
          
                    result.push(<img style={image_style} src={image_src} />);
                    break;
                
                case 'var':
                    
                    result.push(`${params[element.attrs.var] ?? ''}`);
                    break;
        
                case 'foreach':
        
                    const list = params[element.attrs.foreach];
          
                    if (_.isArray(list)) {
                        for (const item of list) {
                            result.push(<BBCodeBody elements={element.elements} params={{ ...params, ...item }} />);
                        }
                    }
                    break;
                    
                case 'cond':
                    
                    if (element.attrs.cond && params[element.attrs.cond]) {
                        result.push(<BBCodeBody elements={element.elements} params={params} />);
                    } else if (element.attrs.not && !params[element.attrs.not]) {
                        result.push(<BBCodeBody elements={element.elements} params={params} />);
                    }
                    break;
                    
                default:
                    
                    result.push(<BBCodeBody elements={element.elements} params={params} />);
                    break;
            }
        }
    }
  
    return result;
}

export const BBCode = React.forwardRef(({
    source,
    ...props
}, forwardRef) => {
    const elements = React.useMemo(() => _.isString(source?.content) ? parse(source.content) : '', [source?.content]);
    return <View ref={forwardRef} {...props}>
        <div style={{
            fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
            fontSize: 14,
        }}><BBCodeBody elements={elements} /></div>
    </View>;
});

export default BBCode;