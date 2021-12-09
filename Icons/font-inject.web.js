//
//  font-inject.js
//
//  The MIT License
//  Copyright (c) 2015 - 2021 Susan Cheng. All rights reserved.
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

const AntDesign = require('react-native-vector-icons/Fonts/AntDesign.ttf');
const Entypo = require('react-native-vector-icons/Fonts/Entypo.ttf');
const EvilIcons = require('react-native-vector-icons/Fonts/EvilIcons.ttf');
const Feather = require('react-native-vector-icons/Fonts/Feather.ttf');
const FontAwesome = require('react-native-vector-icons/Fonts/FontAwesome.ttf');
const FontAwesome5 = require('react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf');
const FontAwesome5Brands = require('react-native-vector-icons/Fonts/FontAwesome5_Brands.ttf');
const Fontisto = require('react-native-vector-icons/Fonts/Fontisto.ttf');
const Foundation = require('react-native-vector-icons/Fonts/Foundation.ttf');
const Ionicons = require('react-native-vector-icons/Fonts/Ionicons.ttf');
const MaterialCommunityIcons = require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf');
const MaterialIcons = require('react-native-vector-icons/Fonts/MaterialIcons.ttf');
const Octicons = require('react-native-vector-icons/Fonts/Octicons.ttf');
const SimpleLineIcons = require('react-native-vector-icons/Fonts/SimpleLineIcons.ttf');
const Zocial = require('react-native-vector-icons/Fonts/Zocial.ttf');

if (global.document) {
  
  const iconFontStyles = `
    @font-face {
      src: url(${AntDesign});
      font-family: AntDesign;
    }
    @font-face {
      src: url(${Entypo});
      font-family: Entypo;
    }
    @font-face {
      src: url(${EvilIcons});
      font-family: EvilIcons;
    }
    @font-face {
      src: url(${Feather});
      font-family: Feather;
    }
    @font-face {
      src: url(${FontAwesome});
      font-family: FontAwesome;
    }
    @font-face {
      src: url(${FontAwesome5});
      font-family: FontAwesome5;
    }
    @font-face {
      src: url(${FontAwesome5Brands});
      font-family: FontAwesome5Brands;
    }
    @font-face {
      src: url(${Fontisto});
      font-family: Fontisto;
    }
    @font-face {
      src: url(${Foundation});
      font-family: Foundation;
    }
    @font-face {
      src: url(${Ionicons});
      font-family: Ionicons;
    }
    @font-face {
      src: url(${MaterialCommunityIcons});
      font-family: MaterialCommunityIcons;
    }
    @font-face {
      src: url(${MaterialIcons});
      font-family: MaterialIcons;
    }
    @font-face {
      src: url(${Octicons});
      font-family: Octicons;
    }
    @font-face {
      src: url(${SimpleLineIcons});
      font-family: SimpleLineIcons;
    }
    @font-face {
      src: url(${Zocial});
      font-family: Zocial;
    }
  `;
  
  const style = global.document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(global.document.createTextNode(iconFontStyles));
  }
  
  global.document.head.appendChild(style);
}
