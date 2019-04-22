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

    for(var k in layoutOut._colorAxes) {
        // TODO won't work for coloraxis2, coloraxis3
        //  probably need to revamp colorscaleDefaults so that
        //  we pass 'inner' containers instead of 'outer'
        //  ....
        colorscaleDefaults(layoutIn, layoutOut, layoutOut, coerce, {
            prefix: k + '.',
            cLetter: 'c'
        });
        layoutOut[k]._name = k;
    }
};
