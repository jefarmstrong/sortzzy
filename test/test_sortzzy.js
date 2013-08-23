var should = require('should')

var bieberData = require('./testdata')
var sortzzy = require('../index')


var bieberFields = [
     {name: 'trackName', type:'string', weight: 1, levenshtein:{ignoreCase:true}}
    ,{name: 'collectionName', type:'string', weight:1, levenshtein:{ignoreCase:true}}
    ,{name: 'trackTimeMillis', type:'numeric',variableRange:{lowerOffset:10000,upperOffset:10000}, weight:1 }
];


describe('Weighted Sort', function(){

    describe('Weighting tests @fubar', function(){
        var data = [
         {a:1,  b:50, c:0 }
        ,{a:2,  b:50, c:0 }
        ,{a:3,  b:50, c:0 }
        ,{a:4,  b:50, c:0 }
        ,{a:5,  b:50, c:0 }
        ,{a:6,  b:50, c:0 }
        ,{a:7,  b:50, c:0 }
        ,{a:8,  b:50, c:0 }
        ,{a:9,  b:100, c:0 }
        ,{a:10, b:50, c:0 }
        ];
        var model = {a:10,b:100,c:100};
        var fields = [
          {name:'a',type:'numeric',fixedRange:[0,10],weight:0.8}
         ,{name:'b',type:'numeric',fixedRange:[0,100],weight:0.2}
         ,{name:'c',type:'numeric',fixedRange:[0,100],weight:0}
        ]
        var out = sortzzy.sort(data, model, fields);
        it('b:100 should sort to the top', function(done){
            should.exist(out);
            out[0].data.b.should.equal(100);
            return done();
        })
    })

    describe('Sort numerics', function(){
        var data = [{n:1},{n:2},{n:3},{n:4},{n:5},{n:6},{n:7},{n:8},{n:9},{n:10}]
        var model = {n:10};
        var fields = [{name:'n',type:'numeric',weight:1,fixedRange:[0,10]}]
        
        it('should sort correctly', function(done){
            var out = sortzzy.sort(data, model, fields);
            should.exist(out);
            out.should.have.length(10);
            out[0].data.n.should.equal(10);
            out[9].data.n.should.equal(1);
            return done();
        })
    })

    describe('Sort fractions', function(){        
        var data = [{n:0.1},{n:0.2},{n:0.3},{n:0.4},{n:0.5},{n:0.6},{n:0.7},{n:0.8},{n:0.9},{n:1.0}]
        var model = {n:1};
        var fields = [{name:'n',type:'numeric',weight:1,fixedRange:[0,1]}]
        var out = sortzzy.sort(data, model, fields);
        it('should sort correctly', function(done){
            should.exist(out);
            out.should.have.length(10);
            out[0].data.n.should.equal(1.0);
            out[9].data.n.should.equal(0.1);
            return done();
        })
    })

    describe('Transform function', function(){        
        var data = [{price:'$100.34'},{price:'$73.02'},{price:'$33.00'},{price:'$52.06'},{price:'$182.10'},{price:'$10.93'}]
        var model = {price:50.00};
        var fields = [{name:'price',type:'numeric',weight:1,variableRange:{lowerOffset:50,upperOffset:50},transform:function(price){return parseFloat(price.substr(1))}}]
        var out = sortzzy.sort(data, model, fields);
        it('should sort correctly', function(done){
            should.exist(out);
            out[0].data.price.should.equal('$52.06');
            return done();
        })
    })

    describe('Score a perfect match', function(){
        it('should return a score of 1', function(done){
            var data = {"title":"This is a title to test"};
            var fields = [{name:"title",type:"string",weight:1}]
            var score = sortzzy.score(data, data, fields);
            score.should.equal(1);
            return done();
        })
    })

    describe('Ignore Case', function(){
        it('should return a score of 1', function(done){
            var data = {"title":"IGNORE CASE IN THIS EXAMPLE"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{ignoreCase:true}}];
            var model = {"title":"ignore case in this example"};
            var score = sortzzy.score(data, model, fields);
            score.should.equal(1);
            return done();
        })
    })
    describe('Ignore Punctuation', function(){
        it('should return a score of 1', function(done){
            var data = {"title":"ignore, punctuation! in 'this' example."};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{ignorePunctuation:true}}];
            var model = {"title":"ignore: punctuation? in \"this\" example!"};
            var score = sortzzy.score(data, model, fields);
            score.should.equal(1);
            return done();
        })
    })
    describe('Ignore Stop Words', function(){
        it('should return a score of 1', function(done){
            var data = {"title":"The he of a test string has that from to with"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{ignoreStopWords:true}}];
            var model = {"title":"test string"};
            var score = sortzzy.score(data, model, fields);
            score.should.equal(1);
            return done();            
        })
    })
    describe('Ignore Full Stop Words', function(){
        it('should return a score of 1', function(done){
            var data = {"title":"The between of a test string has against that from to with"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{ignoreStopWords:true,useFullStopWordsList:true}}];
            var model = {"title":"test string"};
            var score = sortzzy.score(data, model, fields);
            score.should.equal(1);
            return done();            
        })
    })
    describe('Ignore Custom Stop Words', function(){
        it('should return a score of 1', function(done){
            var data = {"title":"Bacon apple test fubar string beep boop"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{ignoreStopWords:true,stopWords:['bacon','apple','fubar','beep','boop']}}];
            var model = {"title":"test string"};
            var score = sortzzy.score(data, model, fields);
            score.should.equal(1);
            return done();            
        })
    })
    describe('Sort levenshtein words', function(){
        it('should return a score of 1', function(done){
            var data = {"title":"apple bannana cake donut egg"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{sorted:true}}];
            var model = {"title":"bannana donut apple egg cake"};
            var score = sortzzy.score(data, model, fields);
            score.should.equal(1);
            return done();            
        })
    })
    describe('Insert Cost', function(){
        it('should return a lower score when insCost > 1', function(done){
            var data = {"title":"this is a test"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{insCost:1}}];
            var model = {"title":"this is a big test"};
            var score1 = sortzzy.score(data, model, fields);
            fields = [{name:"title",type:"string",weight:1,levenshtein:{insCost:2}}];
            var score2 = sortzzy.score(data, model, fields);
            score1.should.be.above(score2)
            return done();            
        })
    })
    describe('Delete Cost', function(){
        it('should return a lower score when delCost > 1', function(done){
            var data = {"title":"this is a big test"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{delCost:1}}];
            var model = {"title":"this is a test"};
            var score1 = sortzzy.score(data, model, fields);
            fields = [{name:"title",type:"string",weight:1,levenshtein:{delCost:2}}];
            var score2 = sortzzy.score(data, model, fields);
            score1.should.be.above(score2)
            return done();            
        })
    })
    describe('Substitution Cost', function(){
        it('should return a lower score when subCost > 1', function(done){
            var data = {"title":"this is a big test"};
            var fields = [{name:"title",type:"string",weight:1,levenshtein:{subCost:1}}];
            var model = {"title":"this is a bad test"};
            var score1 = sortzzy.score(data, model, fields);
            fields = [{name:"title",type:"string",weight:1,levenshtein:{subCost:2}}];
            var score2 = sortzzy.score(data, model, fields);
            score1.should.be.above(score2)
            return done();            
        })
    })


    describe('Simulated Flight Data', function(){        
        var data = [
         {price:510,duration:1.9,layovers:0}
        ,{price:200,duration:5.0,layovers:2}
        ,{price:356,duration:2.4,layovers:1}
        ,{price:295,duration:5.7,layovers:2}
        ,{price:402,duration:4.8,layovers:2}
        ,{price:899,duration:3.5,layovers:0}
        ,{price:853,duration:2.9,layovers:0}
        ,{price:302,duration:8.4,layovers:2}
        ,{price:432,duration:5.3,layovers:1}
        ,{price:421,duration:2.5,layovers:0}
        ]
        var model = {price:0,duration:0,layovers:0};
        var fields = [
         {name:'price',type:'numeric',fixedRange:[0,1000],weight:1}
        ,{name:'duration',type:'numeric',fixedRange:[0,10],weight:100}
        ,{name:'layovers',type:'numeric',fixedRange:[0,2],weight:200}
        ]
        it('Price only should return cheapest flight', function(done){
            fields[0].weight = 1;
            fields[1].weight = 0;
            fields[2].weight = 0;
            var out = sortzzy.sort(data, model, fields);
            should.exist(out);
            out[0].data.price.should.equal(200);
            return done();    
        })
        it('Duration only should return shortest flight', function(done){
            fields[0].weight = 0;
            fields[1].weight = 1;
            fields[2].weight = 0;
            var out = sortzzy.sort(data, model, fields);
            should.exist(out);
            out[0].data.duration.should.equal(1.9);
            return done();    
        })
        it('Price & Duration should return lowest priced short flight', function(done){
            fields[0].weight = 1;
            fields[1].weight = 1;
            fields[2].weight = 0;
            var out = sortzzy.sort(data, model, fields);
            should.exist(out);
            //console.dir(out[0]);
            out[0].data.price.should.equal(356);
            out[0].data.duration.should.equal(2.4);
            return done();    
        })
        it('Equal weighting should return lowest priced short flight without layovers', function(done){
            fields[0].weight = 1;
            fields[1].weight = 1;
            fields[2].weight = 1;
            var out = sortzzy.sort(data, model, fields);
            should.exist(out);
            out[0].data.price.should.equal(421);
            out[0].data.duration.should.equal(2.5);
            out[0].data.layovers.should.equal(0);
            return done();    
        })
    })

    describe('Bieber Data', function(){
        describe('Find "As Long As You Love Me" with track time 280027', function(){
            var bieberModel = {
                 artistName      : 'justin bieber'
                ,trackName       : 'As Long As You Love Me'
                ,collectionName  : 'As Long As You Love Me' 
                ,trackTimeMillis : 280000
            }
            it('should find "As Long As You Love Me (Remixes) [feat. Big Sean]', function(done){
                var output = sortzzy.sort(bieberData, bieberModel, bieberFields);
                should.exist(output);
                //console.dir(output[0])
                output[0].data.collectionName.should.equal("As Long As You Love Me (Remixes) [feat. Big Sean]")
                return done();
            })
        })        
        describe('Find "One Time" with track time 186267 - with wrong Collection Name', function(){
            var bieberModel = {
                 artistName      : 'justin bieber'
                ,trackName       : 'One Time'
                ,collectionName  : 'One Time' 
                ,trackTimeMillis : 190000
            }
            it('should find "One Time"', function(done){
                var output = sortzzy.sort(bieberData, bieberModel, bieberFields);
                should.exist(output);
                output[0].data.collectionName.should.equal("My Worlds Acoustic");
                output[0].data.trackName.should.equal("One Time");
                return done();
            })
        })        
    })

    describe('Return array without scores', function(){
        var bieberModel = {
             artistName      : 'justin bieber'
            ,trackName       : 'One Time'
            ,collectionName  : 'One Time' 
            ,trackTimeMillis : 190000
        }
        it('should find "One Time" without score and obj elements in returned array', function(done){
            var output = sortzzy.sort(bieberData, bieberModel, bieberFields, {dataOnly:true});
            should.exist(output);
            output[0].collectionName.should.equal("My Worlds Acoustic");
            output[0].trackName.should.equal("One Time");
            should.not.exist(output[0].score);
            return done();
        })
    })

    describe('Transform Tracks to remove extras', function() {
        var bieberModel = {
             trackName       : 'One Time'
        }
        function _transform(str) {
            // remove anything between () or []
            var str = str.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*\] */g, "");
            str = this._removePunctuation(str);
            return str;
        }
        var bieberFields = [
             {name: 'trackName', type:'string', weight: 0.7, levenshtein:{ignoreCase:true, trim:true, ignorePunctuation:true, transform:_transform}}
            ,{name: 'trackName', type:'string', weight: 0.3, levenshtein:{ignoreCase:true, ignorePunctuation:true} }
        ];            
        it('should sort ALL (5) "One Time" songs to top', function(done) {
            var output = sortzzy.sort(bieberData, bieberModel, bieberFields);
            for (var i = 0; i < 5; i++) {
                //console.log("%d: %s", output[i].score, output[i].data.trackName)
                var hasOneTime = output[i].data.trackName.substr(0,8).toLowerCase();
                hasOneTime.should.equal('one time');
            }
            return done();
        });
    })

    describe('One Time Documenation example', function() {
        var model = {
            artistName      : 'justin bieber',
            trackName       : 'One Time',
            trackTimeMillis : 190000 
        }
        var fields = [
          {name:'artistName', type:'string', weight:1, levenshtein:{ignoreCase:true}},
          {name:'trackName', type:'string', weight:1, levenshtein:{ignoreCase:true}},
          {name:'trackTimeMillis', type:'numeric', weight:2, fixedRange:[160000, 220000]}
        ]
        it('should sort "One Time" song to top', function(done) {
            var output = sortzzy.sort(bieberData, model, fields);
            var hasOneTime = output[0].data.trackName.substr(0,8).toLowerCase();
            hasOneTime.should.equal('one time');
            return done();
        });
    })

})
