/*
Copyright (c) 2013, Jef Armstrong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
var levenshteinNormalized = require('./normalized')


function sort(data, model, fields, options) {
    if (!Array.isArray(data)) data = [data];
    options = options || {sortInPlace: false};
    var output = [];
    data.forEach(function(element, index){
        var objScore = 0;
        var objWeight = 0;
        fields.forEach(function(field){
            var val = element[field.name];
            var score = 0;
            switch (field.type) {
                case 'string': 
                    score = levenshteinNormalized(val || "", model[field.name], field.levenshtein || options.levenshtein || null);
                    break;
                case 'numeric': 
                    var value = (field.transform ? field.transform(val) : val);
                    var min, max;
                    if (field.fixedRange) {
                        min = field.fixedRange[0];
                        max = field.fixedRange[1];
                    }else if (field.variableRange) {
                        min = model[field.name] - (field.variableRange.lowerOffset || 0);
                        max = model[field.name] + (field.variableRange.upperOffset || 0);
                    }else {
                        min = model[field.name];
                        max = model[field.name];
                    }
                    value = Math.min(max, Math.max(min,value));
                    var diff = Math.abs(value - model[field.name]);
                    score = ((max - diff) - min) / (max - min);
                    break;
                case 'boolean': 
                    score = val ? 1 : 0;
                    break;
                default:
                    score = 0;
                    break;
            }
            objWeight += field.weight || 1;
            objScore += (score * (field.weight || 0));
        })
        objScore = objScore / objWeight;
        if (!options.minimumScoreThreshold || (objScore >= options.minimumScoreThreshold) ) {
            output.push({
                 score : objScore || 0
                ,data  : element 
            })
        }
    })
    output.sort(function(a,b){
        return a.score > b.score ? -1 : b.score > a.score ? 1 : 0;
    })
    if (options.dataOnly) {
        output = output.map(function(element){ return element.data });
    }
    return output;
}
module.exports = sort;
