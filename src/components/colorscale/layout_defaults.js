/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Lib = require('../../lib');

var colorscaleAttrs = require('./layout_attributes');
var colorscaleDefaults = require('./defaults');

module.exports = function supplyLayoutDefaults(layoutIn, layoutOut) {
    function coerce(attr, dflt) {
        return Lib.coerce(layoutIn, layoutOut, colorscaleAttrs, attr, dflt);
    }

    coerce('colorscale.sequential');
    coerce('colorscale.sequentialminus');
    coerce('colorscale.diverging');

    var colorAxIn, colorAxOut;

    function coerceAx(attr, dflt) {
        return Lib.coerce(colorAxIn, colorAxOut, colorscaleAttrs.coloraxis, attr, dflt);
    }

    for(var k in layoutOut._colorAxes) {
        colorAxIn = layoutIn[k] || {};

        // TODO templates ???
        colorAxOut = layoutOut[k];
        if(!colorAxOut) colorAxOut = layoutOut[k] = {};
        colorAxOut._name = k;

        colorscaleDefaults(colorAxIn, colorAxOut, layoutOut, coerceAx, {prefix: '', cLetter: 'c'});
    }
};
