//
//  bbcode2html.js
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

import { parse, html_escaper } from './ast';

export function bbcode2html(content, params = {}) {

  if (_.isString(content)) {
    return bbcode2html(parse(content), params);
  }

  let html = '';
  
  for (const element of content) {

    if (element.type === 'text') {

      const text = html_escaper.escape(element.text).replace(/[^\S\r\n]/g, (c) => c === ' ' ? '&nbsp' : `&#${c.charCodeAt(0)};`);

      html += text.replace(/\r\n|\r|\n/g, '<br />');

    } else if (element.type === 'tag') {

      switch (element.tag) {

        case 'b':

          html += '<strong>';
          html += bbcode2html(element.elements, params);
          html += '</strong>';
          break;

        case 'i':

          html += '<i>';
          html += bbcode2html(element.elements, params);
          html += '</i>';
          break;

        case 'u':

          html += '<u>';
          html += bbcode2html(element.elements, params);
          html += '</u>';
          break;

        case 's':

          html += '<strike>';
          html += bbcode2html(element.elements, params);
          html += '</strike>';
          break;

        case 'sub':

          html += '<sub>';
          html += bbcode2html(element.elements, params);
          html += '</sub>';
          break;

        case 'sup':

          html += '<sup>';
          html += bbcode2html(element.elements, params);
          html += '</sup>';
          break;
          
        case 'color':

          html += `<span style="color:${element.attrs.color ?? ''};">`;
          html += bbcode2html(element.elements, params);
          html += '</span>';
          break;
          
        case 'size':

          let font_size;

          if (element.attrs.size) {
            if (/^\d+$/.exec(element.attrs.size)) {
              const size_map = {
                '1': 'xx-small',
                '2': 'x-small',
                '3': 'small',
                '4': 'medium',
                '5': 'large',
                '6': 'x-large',
                '7': 'xx-large',
              }
              font_size = size_map[element.attrs.size] ?? `${element.attrs.size}px`;
            } else {
              font_size = element.attrs.size;
            }
          }

          html += `<span style="font-size:${font_size ?? ''};">`;
          html += bbcode2html(element.elements, params);
          html += '</span>';
          break;
          
        case 'font':

          html += `<span style="font-family:${element.attrs.font ?? ''};">`;
          html += bbcode2html(element.elements, params);
          html += '</span>';
          break;
          
        case 'left':

          html += `<div style="text-align: left;">`;
          html += bbcode2html(element.elements, params);
          html += '</div>';
          break;
        
        case 'center':

          html += `<div style="text-align: center;">`;
          html += bbcode2html(element.elements, params);
          html += '</div>';
          break;
        
        case 'right':

          html += `<div style="text-align: right;">`;
          html += bbcode2html(element.elements, params);
          html += '</div>';
          break;
        
        case 'justify':

          html += `<div style="text-align: justify;">`;
          html += bbcode2html(element.elements, params);
          html += '</div>';
          break;
        
        case 'ul':

          html += '<ul style="margin:0;">';
          html += bbcode2html(element.elements, params);
          html += '</ul>';
          break;
          
        case 'ol':

          html += '<ol style="margin:0;">';
          html += bbcode2html(element.elements, params);
          html += '</ol>';
          break;
          
        case 'li':

          html += '<li>';
          html += bbcode2html(element.elements, params);
          html += '</li>';
          break;
          
        case 'table':

          const table_style = {
            'border-collapse': 'collapse',
            ...element.attrs
          };

          let table_style_str = '';
          for (const [key, value] of Object.entries(table_style)) {
            table_style_str += `${key}:${value};`;
          }

          html += `<table style="${table_style_str}">`;
          html += bbcode2html(element.elements, params);
          html += '</table>';
          break;
          
        case 'tr':

          const tr_style  = {
            ...element.attrs
          };

          let tr_style_str = '';
          for (const [key, value] of Object.entries(tr_style)) {
            tr_style_str += `${key}:${value};`;
          }

          html += `<tr style="${tr_style_str}">`;
          html += bbcode2html(element.elements, params);
          html += '</tr>';
          break;
          
        case 'td':
          
          const td_style  = {
            'border': '1px solid gray',
            ...element.attrs
          };

          const td_attrs = [
            'colspan',
            'rowspan',
          ]
          
          let td_style_str = '';
          let td_attrs_str = '';
          for (const [key, value] of Object.entries(td_style)) {
            if (td_attrs.includes(key)) {
              td_attrs_str += ` ${key}="${value}"`;
            } else {
              td_style_str += `${key}:${value};`;
            }
          }

          html += `<td style="${td_style_str}"${td_attrs_str}>`;
          html += bbcode2html(element.elements, params);
          html += '</td>';
          break;
          
        case 'hr':

          html += '<hr />';
          break;
          
        case 'url':

          html += `<a href="${element.attrs.url ?? ''}">`;
          html += bbcode2html(element.elements, params);
          html += '</a>';
          break;
        
        case 'img':

          let image_style = '';

          if (element.attrs.img) {
            const match = /(\d+)x(\d+)/.exec(element.attrs.img);
            if (match) {
              image_style += `width:${match[1]}px;`;
              image_style += `height:${match[2]}px;`;
            }
          } else {
            if (element.attrs.width) {
              if (/^\d+$/.exec(element.attrs.width)) {
                image_style += `width:${element.attrs.width}px;`;
              } else {
                image_style += `width:${element.attrs.width};`;
              }
            }
            if (element.attrs.height) {
              if (/^\d+$/.exec(element.attrs.height)) {
                image_style += `height:${element.attrs.height}px;`;
              } else {
                image_style += `height:${element.attrs.height};`;
              }
            }
          }

          let image_src;
          if (element.elements.length === 1 && element.elements[0].type === 'text') {
            image_src = element.elements[0].text;
          }

          html += `<img style="${image_style}" src="${image_src ?? ''}">`;
          break;
        
        case 'var':

          html += `${params[element.attrs.var] ?? ''}`;
          break;

        case 'foreach':

          const list = params[element.attrs.foreach];

          if (_.isArray(list)) {
            for (const item of list) {
              html += bbcode2html(element.elements, { ...params, ...item });
            }
          }
          break;
      
        case 'cond':

          if (element.attrs.cond && params[element.attrs.cond]) {

            html += bbcode2html(element.elements, params);

          } else if (element.attrs.not && !params[element.attrs.not]) {

            html += bbcode2html(element.elements, params);

          }
          break;
          
        default:

          html += bbcode2html(element.elements, params);
          break;
      }
    }
  }

  return html;
}
