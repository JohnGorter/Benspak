var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var boxmodelSchema = new mongoose.Schema({
      name: String,
      marginLengthAndWidth: Number,
      marginHeight: Number,
      waste: Number
    });

boxmodelSchema.methods.calculateArea = function(length, width, height, amount, fn) {
   var totalLength = ((length * 2) + (width * 2) + this.marginLengthAndWidth);
   var totalHeight = ((height + width) + this.marginHeight);
   fn(null, ((totalHeight*(totalLength+this.waste)) / 1000000) * amount);
};

var margesSchema = new mongoose.Schema({
      amount: Number,
      marginBelow100: Number,
      marginAbove100: Number
});

margesSchema.statics.getMargeByAmount = function(mnt, fn) {
      models.margins.find(function(err, margin){
         margin.sort(function (a, b){return a.amount > b.amount; });
         for (m in margin) {
           if (mnt < margin[m].amount){
              fn(null, margin[m-1]);
              break;
           }
         }
      });
};
margesSchema.methods.calculateMarge = function(totalm2) {
     return totalm2 < 100 ? this.marginBelow100 : this.marginAbove100;
};

var priceListSchema = new mongoose.Schema({
       name: String,
       priceFrom100: Number,
       priceFrom200: Number,
       priceFrom1000: Number,
       priceFrom3000: Number
});

priceListSchema.methods.calculatePrice = function(area, amount, fn) {
   var price = 0; 
   if (area < 200) price = (area * this.priceFrom100) / 1000;
   else if (area < 1000) price = (area * this.priceFrom200) / 1000;
   else if (area < 3000) price = (area * this.priceFrom1000) / 1000;
   else price = (area * this.priceFrom3000) / 1000;
   
   models.margins.getMargeByAmount(amount, function(err, margin){
                    var calmargin = 50;
                    if (margin != null){
                        if (area < 100) {
                           calmargin = margin.marginBelow100;
                        } else {
                            calmargin = margin.marginAbove100;
                        }
                    }
                    console.log("calculated all");
                    fn(null, price * amount, calmargin, area); });
};



var boxmodel = mongoose.model('boxmodel', boxmodelSchema);
var pricelist = mongoose.model('pricelist', priceListSchema);
var marges = mongoose.model('marges', margesSchema); 

var models = {};

models.boxmodel = boxmodel;
models.pricelist = pricelist;
models.margins = marges;

models.seed = function(){
    var fefco201 = new models.boxmodel({ name: 'fefco201', marginLengthAndWidth: 12, marginHeight: 12, waste: 55 });
    var pricelist = new models.pricelist({ name: 'C', priceFrom100: 505, priceFrom200: 345, priceFrom1000: 335, priceFrom3000: 325 });
    var marginlist = [new models.margins ({ amount:0, marginBelow100:50, marginAbove100:50 }),
      new models.margins ({ amount:50, marginBelow100:90, marginAbove100:70 }),
      new models.margins ({ amount:100, marginBelow100:110, marginAbove100:90 }),
      new models.margins ({ amount:200, marginBelow100:140, marginAbove100:100 }),
      new models.margins ({ amount:500, marginBelow100:155, marginAbove100:135 }),
      new models.margins ({ amount:1000, marginBelow100:190, marginAbove100:160 }),
      new models.margins ({ amount:1500, marginBelow100:205, marginAbove100:175 }),
      new models.margins ({ amount:2000, marginBelow100:245, marginAbove100:190 })];
    
    console.log ("seeding data into mongodb");
    fefco201.save();
    pricelist.save();
    for (margin in marginlist)
      marginlist[margin].save(); 
};

module.exports = models;