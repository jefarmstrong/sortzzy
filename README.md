# Sortzzy

Sortzzy is a utility module which provides a simple way to fuzzy sort 
an array of JSON objects based on a target model and a set of weighted 
field descriptors. Strings in the data set can be compared against the 
model with the built in Levenshtein Distance algorithm. Numerics can be
compared by their distance to a given number with a bounding range.

This utility was created out of a requirement to find the best matching
song given a model to start with. The problem was that song titles, album
titles and artist names don't always match and I needed to also take
into account numeric data like track times.  

## Examples

Given some song data:

```javascript

    var data = [ 
     { 
       artistName: 'Justin Bieber',
       collectionName: 'One Time (My Heart Edition) - Single',
       trackName: 'One Time (My Heart Edition)',
       trackTimeMillis: 191697,
       },
      { 
       artistName: 'Justin Bieber',
       collectionName: 'My Worlds Acoustic',
       trackName: 'One Time',
       trackTimeMillis: 186267,
       },
     { 
       artistName: 'Justin Bieber',
       collectionName: 'Radio Disney Jams 12',
       trackName: 'One Time (My Heart Edition)',
       trackTimeMillis: 190667,
     },
     { 
       artistName: 'The Justin Bieber Tribute Band',
       collectionName: 'One Time - Single',
       trackName: 'One Time',
       trackTimeMillis: 240148,
     }
   
     . . . 
    ]
```


```javascript
    
    var sortzzy = require('sortzzy')

    // Create the model to match against
    var model = {
        artistName      : 'justin bieber',
        trackName       : 'One Time',
        trackTimeMillis : 190000 
    }

    // Define the fields 
    var fields = [
          {name:'artistName', type:'string', weight:1, options:{ignoreCase:true}},
          {name:'trackName', type:'string', weight:1, options:{ignoreCase:true}},
          {name:'trackTimeMillis', type:'numeric', weight:2, fixedRange:[160000, 220000]}
        ]

    var result = sortzzy.sort(data, model, fields);

    /*  
        result[0] == 
        { 
          score: 0.9688916666666667,
          data: {
             artistName: 'Justin Bieber',
             collectionName: 'My Worlds Acoustic',
             trackName: 'One Time',
             trackTimeMillis: 186267
          }
        }

    */

```


## Download

Releases are available for download from
[GitHub](http://github.com/jefarmstrong/sortzzy/downloads).
Alternatively, you can install using Node Package Manager (npm):

    npm install sortzzy


## Documentation

### sort(arr, model, fields, options)

Scores each item in the array as it relates to the given model using the array of field descriptors. Returns either a new array with a score element and the original data in a data element, or a new array sorted by the score, but without it being included.

__Arguments__

* **arr** - An array of JSON objects.
* **model** - A JSON object that is the model of the item you are looking for.
* **fields** - An array of field descriptors. Each field descriptor can have the following 

    * **name** - The name of the field in *model* for which this descriptor describes
    * **type** - The type for this descriptor: *'string'* || *'numeric'* || *'boolean'*
    * **weight** - The numeric weight for this field. Can be any number.
    * **fixedRange** - *optional* - An array with a lower and upper bounds for the field value. Eg. ```[0,100]```
    * **variableRange** - *optional* 
        * lowerOffset - A number which will be subtracted from the value of this fields model to set the lower bound of the fields value.
        * upperOffset - A number which will be added to the value of this fields model to set the upper bound of the fields value. 
        *note: for numeric types, either fixedRange or variableRange should be included*
    * **transform** - *optional* - A function to transform the value of the field. It should take one argument and return the transformed value.
    * **levenshtein** - *optional* - Options for the levenshtein function (if this is a 'string' type). *(see levenshtein function for options)*
* **options** - 
    * **minimumScoreThreshold** - Elements with scores below this threshold will not be included in resulting array.
    * **dataOnly** - If true, then the resulting array is just the sorted data, no scores are returned.

### score(obj, model, fields, options)

Same as sort() but only returns the score for a single object compared against model.


### levenshtein(stringX, stringY, options)

Performs the levenshtein distance algorithm between *stringX* and *stringY*.

__Options__

* **insCost** - the "cost" of an insert action in the levenshtein algorithm. Defaults to 1.
* **delCost** - the "cost" of a deletion action in the levenshtein algorithm. Defaults to 1.
* **subCost** - the "cost" of a substitution action in the levenshtein algorithm. Defaults to 1.
* **transform** - a function that will be called for each string before the levenshtein distance algorithm is run. The function should take a single string and return a string. 
* **ignoreCase** - set to true to ignore case in the comparison.
* **ignorePunctuation** - set to true to remove punctuation before the comparison.
* **ignoreStopWords** - set to true to remove common words before the comparison. (see lib/stopWords)
* **useFullStopWordsList** - set to true, in conjunction with *ignoreStopWords* to use a much larger list of common words (see lib/stopWords)
* **stopWords** - an array of words to use as stop words, in conjuction with *ignoreStopWords*.
* **sorted** - set to true to sort the words in each string before the comparison. 

### normalizedLevenshtein(stringX, stringY, options) 

Same as *levenshtein* but returns a score between 0 and 1.



