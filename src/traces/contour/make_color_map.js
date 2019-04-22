/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/


'use strict';

var d3 = require('d3');
var Colorscale = require('../../components/colorscale');
var endPlus = require('./end_plus');

module.exports = function makeColorMap(trace) {
    var contours = trace.contours;
    var start = contours.start;
    var end = endPlus(contours);
    var cs = contours.size || 1;
    var nc = Math.floor((end - start) / cs) + 1;
    var extra = contours.coloring === 'lines' ? 0 : 1;
    var cont = trace._colorAx || trace;

    if(!isFinite(cs)) {
        cs = 1;
        nc = 1;
    }

    var scl = cont.reversescale ?
        Colorscale.flipScale(cont.colorscale) :
        cont.colorscale;

    var len = scl.length;
    var domain = new Array(len);
    var range = new Array(len);

    var si, i;

    if(contours.coloring === 'heatmap') {
        var cLetter = trace._colorAx ? 'c' : 'z';
        var zauto = cont[cLetter + 'auto'];
        var zmin0 = cont[cLetter + 'min'];
        var zmax0 = cont[cLetter + 'max'];

        if(zauto && trace.autocontour === false) {
            zmin0 = start - cs / 2;
            zmax0 = zmin0 + nc * cs;
        }

        for(i = 0; i < len; i++) {
            si = scl[i];
            domain[i] = si[0] * (zmax0 - zmin0) + zmin0;
            range[i] = si[1];
        }

        // do the contours extend beyond the colorscale?
        // if so, extend the colorscale with constants
        var zRange = d3.extent([
            zmin0,
            zmax0,
            contours.start,
            contours.start + cs * (nc - 1)
        ]);
        var zmin = zRange[zmin0 < zmax0 ? 0 : 1];
        var zmax = zRange[zmin0 < zmax0 ? 1 : 0];

        if(zmin !== zmin0) {
            domain.splice(0, 0, zmin);
            range.splice(0, 0, Range[0]);
        }

        if(zmax !== zmax0) {
            domain.push(zmax);
            range.push(range[range.length - 1]);
        }

        // TODO do we need to mutate those back in??
        cont[cLetter + 'min'] = zmin0;
        cont[cLetter + 'max'] = zmax0;
    } else {
        for(i = 0; i < len; i++) {
            si = scl[i];
            domain[i] = (si[0] * (nc + extra - 1) - (extra / 2)) * cs + start;
            range[i] = si[1];
        }
    }

    return Colorscale.makeColorScaleFunc(
        {domain: domain, range: range},
        {noNumericCheck: true}
    );
};
