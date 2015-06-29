var mongoose = require('mongoose');
var express  = require('express');
var models   = require('./models.js');
var app      = express();

mongoose.connect("mongodb://localhost/benspak");

/*models.seed(); */

var length = 200, width = 200, height = 100;

function getPriceForModel(length, width, height, amount, fn) {
  models.boxmodel.find({name:'fefco201'}, function(err, box) {
      box = (box instanceof Array) ? box[0] : box;
      models.pricelist.find({name:"C"}, function(err, pricelist) {
        pricelist = (pricelist instanceof Array) ? pricelist[0] : pricelist;
        box.calculateArea(length, width, height, amount, function(err, total) {
            pricelist.calculatePrice(total, amount, function(err, totalPrice, margin, area){
                fn(null, totalPrice, margin, area);
            });
        });
      });
  });
}


console.log("cotinue on.."); 
/*  
// create a new user called chris
*/

app.get('/benspak/price/:length/:width/:height/:amount', function(req, res){
    var length = parseInt(req.params.length);
    var height = parseInt(req.params.height);
    var width = parseInt(req.params.width);
    var amount = parseInt(req.params.amount);
    var verbose = req.query.verbose;
    if (verbose) {
      getPriceForModel(length, width, height, amount, function(err, price, margin, area, cutoff, priceperm2){
         var pricetotal = Math.round((price + margin) * 100) / 100;
         res.write ("Calculating price with length: " + length + ", width: " + width + ", heigth: " + height + ", amount: " + amount + "\r\n");
         res.write ("Calculated area: " + area + "\r\n");
         res.write ("Calculated cutoff: " + cutoff + "\r\n");
         res.write ("Calculated price per m2: " + priceperm2 + "\r\n");
         res.write ("Calculated transport: " + "19.00" + "\r\n");
         res.write ("Calculated margin: " + margin + "\r\n");
         res.write ("Calculated price total: " + (pricetotal + 19) + "\r\n");
         res.end("done."+ "\r\n"); 
         
      });
    } else {
        getPriceForModel(length, width, height, amount, function(err, price, margin){
        res.end("price verbose = " + Math.round((price + margin) * 100) / 100);
    });
    }
});


app.listen(1337);
console.log('Server running at http://127.0.0.1:1337');
