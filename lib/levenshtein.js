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
var stopWords = require('./stopWords');

var ld = {
    stopWordsRegExp : new RegExp("\\b(" + stopWords.list.join("|") + ")\\b", "gi"),
    stopWordsShortListRegExp : new RegExp("\\b(" + stopWords.shortList.join("|") + ")\\b", "gi"),

    _removeSpaces : function(str) {
        return (str||"").replace(/\s{2,}/g," ");
    },
    _removePunctuation : function(str) {
        return this._removeSpaces((str||"").replace(/[\.,-\/#!\?$%\^&\*;:{}=\-_`~()'"]/g,""))
    },
    _removeStopWords : function(str, words) {
        return this._removeSpaces((str||"").replace( (words || this.stopWordsShortListRegExp), "")).trim();
    },
    _sort : function(str) {
        return this._removePunctuation(str||"").split(" ").sort().join(" ");
    },
    levenshtein : function(x, y, options) {
        if (typeof x !== 'string' || typeof y !== 'string') {
            return Math.max((x||{}).length||0,(y||{}).length||0) || 0;
        }
        options = options || {};
        options.insCost = options.insCost || 1;
        options.delCost = options.delCost || 1;
        options.subCost = options.subCost || 1;

        if (options.transform && typeof options.transform === 'function') {
            x = options.transform.call(this, x);
            y = options.transform.call(this, y);
        }
        if (options.ignoreCase) {
            x = x.toLowerCase();
            y = y.toLowerCase();
        }
        if (options.ignorePunctuation) {
            x = this._removePunctuation(x);
            y = this._removePunctuation(y);
        }
        if (options.ignoreStopWords) {
            var wrds = this.stopWordsShortListRegExp;
            if (options.stopWords) {
                  wrds = new RegExp("\\b(" + options.stopWords.join("|") + ")\\b", "gi");
            }else if (options.useFullStopWordsList) {
                wrds = this.stopWordsRegExp;
            }
            x = this._removeStopWords(x, wrds);
            y = this._removeStopWords(y, wrds);
        }
        if (options.trim) {
            x = x.trim();
            y = y.trim();
        }
        if (options.sorted) {
            x = this._sort(x);
            y = this._sort(y);
        }
        var  m = x.length
            ,n = y.length
        if (Math.min(m, n) === 0) {
            return Math.max(m,n);
        }
        var i = 0, j = 0, d = [];
        for (i = 0 ; i <= m ; i++) {
            d[i] = [];
            d[i][0] = i;
        }
        for (j = 0 ; j <= n ; j++) {
            d[0][j] = j;
        }
        for (i = 1 ; i <= m ; i++) {
            for (j = 1 ; j <= n ; j++) {
                d[i][j] = Math.min(
                    d[i - 1][j] + options.delCost,
                    d[i][j - 1] + options.insCost, 
                    d[i - 1][j - 1] + (x.charAt(i - 1) === y.charAt(j - 1) ? 0 : options.subCost)
                );
            }
        }
        return d[m][n];
    }
}
module.exports = ld;
