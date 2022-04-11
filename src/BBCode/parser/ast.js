//
//  parse.js
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

export const html_escaper = (() => {

    const {replace,match} = '';
  
    const ds = /[0-9]{2,3}/g;
    const es = /&(?:amp|lt|gt|apos|quot|#[0-9]{2,3});/g;
    const ca = /[&<>\[\]'"]/g;
  
    const esca = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '[': '&#91;',
        ']': '&#93;',
        "'": '&#39;',
        '"': '&quot;'
    };
    const pe = m => esca[m];
  
    const unes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&apos;': "'",
        '&quot;': '"'
    };
    const cape = m => {
        const digits = match.call(m, ds);
        if (digits) {
            const ascii = parseInt(digits);
            if (32 <= ascii && ascii <= 126)
            return String.fromCharCode(ascii);
        }
        return unes[m];
    };
  
    return {
        escape: es => replace.call(es, ca, pe),
        unescape: un => replace.call(un, es, cape),
    };
  
})();

const tags = {
    b: { breakStart: true, breakAfter: true },
    i: { breakStart: true, breakAfter: true },
    u: { breakStart: true, breakAfter: true },
    s: { breakStart: true, breakAfter: true },
    sub: { breakStart: true, breakAfter: true },
    sup: { breakStart: true, breakAfter: true },
    left: { breakStart: true, breakAfter: true },
    center: { breakStart: true, breakAfter: true },
    right: { breakStart: true, breakAfter: true },
    justify: { breakStart: true, breakAfter: true },
    font: { breakStart: true, breakAfter: true },
    size: { breakStart: true, breakAfter: true },
    color: { breakStart: true, breakAfter: true },
    ul: {},
    ol: {},
    li: {},
    table: {},
    tr: {},
    td: {},
    hr: { isSelfClosing: true },
    img: { breakAfter: true },
    url: { breakStart: true, breakAfter: true }
}

const tag_regex = /\[([^\/\[\]\n\r\s=]+)(?:=([^\[\]\n\r]+))?((?:\s+(?:[^\/\[\]\n\r\s=]+)=(?:[^\[\]\n\r\s]+))*)\]|\[\/([^\/\[\]\n\r\s=]+)\]/;
const space_regex = /\s+/;
const attrs_regex = /([^\/\[\]\n\r\s=]+)=([^\[\]\n\r\s]+)/;
const newline_regex = /\r\n|\r|\n/;

function match_result(matches) {

    const [match, tag1, attr, attrs_str, tag2] = matches;
    const tag = tag1 ?? tag2;
  
    const attrs_list = space_regex[Symbol.split](attrs_str).filter(x => !_.isEmpty(x));
    const attrs = {};
  
    for (const [, key, val] of attrs_list.map(x => attrs_regex.exec(x) ?? [])) {
      if (!_.isNil(key) && !_.isNil(val)) {
        attrs[key] = val;
      }
    }
  
    const _attrs = _.isNil(attr) ? attrs : {
      [tag]: attr,
      ...attrs
    };
  
    return { match, tag, attrs: _attrs };
}

class TextElement {

    constructor(text) {
        this.type = 'text';
        this.text = text;
    }
}

class TagElement {

    constructor(tag, attrs) {
        this.type = 'tag';
        this.tag = tag;
        this.attrs = attrs;
        this.elements = [];
    }
}

export function parse(docs) {

    let str = docs;
    let stacks = [];
    let elements = [];
    
    while (str.length > 0) {
      
      let matches;
  
      if (!_.isNil(matches = tag_regex.exec(str))) {
  
        let prefix = str.slice(0, matches.index);
        let suffix = str.slice(matches.index + matches[0].length);
        let { match, tag, attrs } = match_result(matches);
  
        if (!_.isEmpty(prefix)) {
          elements.push(new TextElement(html_escaper.unescape(prefix)));
        }
  
        if (_.isNil(tags[tag])) {
  
          if (!_.isEmpty(match)) {
            elements.push(new TextElement(html_escaper.unescape(match)));
          }
  
        } else if (match.startsWith('[/')) {
  
          if (_.last(stacks)?.tag === tag) {
  
            const last = stacks.pop().elements;
            _.last(last).elements = elements;
    
            elements = last;
  
            if (tags[tag]?.breakAfter !== true) {
              let newline_match;
              if ((newline_match = newline_regex.exec(suffix)) && newline_match.index === 0) {
                suffix = suffix.slice(newline_match[0].length);
              }
            }
  
          } else {
  
            if (!_.isEmpty(match)) {
              elements.push(new TextElement(html_escaper.unescape(match)));
            }
          }
  
        } else {
  
          elements.push(new TagElement(tag, attrs));
  
          if (tags[tag]?.isSelfClosing !== true) {
  
            stacks.push({ tag, elements });
            elements = [];
  
            if (tags[tag]?.breakAfter !== true) {
              let newline_match;
              if ((newline_match = newline_regex.exec(suffix)) && newline_match.index === 0) {
                suffix = suffix.slice(newline_match[0].length);
              }
            }
  
          } else if (tags[tag]?.breakStart !== true) {
  
            let newline_match;
            if ((newline_match = newline_regex.exec(suffix)) && newline_match.index === 0) {
              suffix = suffix.slice(newline_match[0].length);
            }
          }
        }
  
        str = suffix;
  
      } else {
  
        if (!_.isEmpty(str)) {
          elements.push(new TextElement(html_escaper.unescape(str)));
        }
  
        while (stacks.length > 0) {
          const last = stacks.pop().elements;
          _.last(last).elements = elements;
          elements = last;
        }
  
        return elements;
      }
    }
  
    while (stacks.length > 0) {
      const last = stacks.pop().elements;
      _.last(last).elements = elements;
      elements = last;
    }
  
    return elements;
}
