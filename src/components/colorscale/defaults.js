/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var isNumeric = require('fast-isnumeric');

var Lib = require('../../lib');
var hasColorbar = require('../colorbar/has_colorbar');
var colorbarDefaults = require('../colorbar/defaults');

var isValidScale = require('./scales').isValid;
var traceIs = require('../../registry').traceIs;

function npMaybe(cont, prefix) {
    if(prefix) {
        var containerStr = prefix.slice(0, prefix.length - 1);
        var np = Lib.nestedProperty(cont, containerStr);
        var val = np.get();
        if(val) {
            return val;
        } else {
            np.set({});
            return np.get();
        }
    }
    return cont;
}

module.exports = function colorScaleDefaults(outerContIn, outerContOut, layout, coerce, opts) {
    var prefix = opts.prefix;
    var cLetter = opts.cLetter;
    var inTrace = '_module' in outerContOut;
    var containerIn = npMaybe(outerContIn, prefix);
    var containerOut = npMaybe(outerContOut, prefix);
    var template = npMaybe(outerContOut._template || {}, prefix) || {};

    if(inTrace) {
        var colorAxes = layout._colorAxes || {};
        var colorAx = coerce(prefix + 'coloraxis');

        if(colorAx) {
            var colorbarVisuals = (
                traceIs(outerContOut, 'contour') &&
                Lib.nestedProperty(outerContOut, 'contours.coloring').get()
            ) || 'heatmap';

            if(colorAxes[colorAx]) {
                if(colorAxes[colorAx][0] === colorbarVisuals) {
                    return;
                } else {
                    Lib.log([
                        'Ignoring coloraxis:', colorAx, 'setting',
                        'as it is linked to incompatible colorscales.'
                    ].join(' '));
                }
            } else {
                // stash colorbar options to help in Colorbar.draw
                colorAxes[colorAx] = [colorbarVisuals, outerContOut];
                return;
            }
        }

        // otherwise clear coloraxis and go on to coerce colorscale attrs
        Lib.nestedProperty(outerContOut, prefix + 'coloraxis').set(null);
    }

    var minIn = containerIn[cLetter + 'min'];
    var maxIn = containerIn[cLetter + 'max'];
    var validMinMax = isNumeric(minIn) && isNumeric(maxIn) && (minIn < maxIn);
    var auto = coerce(prefix + cLetter + 'auto', !validMinMax);

    if(auto) {
        coerce(prefix + cLetter + 'mid');
    } else {
        coerce(prefix + cLetter + 'min');
        coerce(prefix + cLetter + 'max');
    }

    // handles both the trace case (autocolorscale is false by default) and
    // the marker and marker.line case (autocolorscale is true by default)
    var sclIn = containerIn.colorscale;
    var sclTemplate = template.colorscale;
    var autoColorscaleDflt;
    if(sclIn !== undefined) autoColorscaleDflt = !isValidScale(sclIn);
    if(sclTemplate !== undefined) autoColorscaleDflt = !isValidScale(sclTemplate);
    coerce(prefix + 'autocolorscale', autoColorscaleDflt);

    coerce(prefix + 'colorscale');
    coerce(prefix + 'reversescale');

    if(prefix !== 'marker.line.') {
        // handles both the trace case where the dflt is listed in attributes and
        // the marker case where the dflt is determined by hasColorbar
        var showScaleDflt;
        if(prefix && inTrace) showScaleDflt = hasColorbar(containerIn);

        var showScale = coerce(prefix + 'showscale', showScaleDflt);
        if(showScale) colorbarDefaults(containerIn, containerOut, layout);
    }
};
