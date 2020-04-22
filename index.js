var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
require('dotenv').config();
var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);
var app=express();
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');
app.use(bodyParser.urlencoded({extended:true}));
app.get('/', function(req, res) {
    res.render('step1');
  });
  app.post('/step2',function(req,res){
      var number=req.body.number;
      messagebird.verify.create(number,{
          originator:'Code',
          template:'Your verification code is %token.'
      },function(err, response){
          if(err){
              console.log(err);
              res.render('step1',{
                error: err.errors[0].description,
              });
          }else{
              console.log(response);
              res.render('step2',{
                  id:response.id
              });
          }
      })
  });

app.post('/step3',function(req,resp){
    var id=req.body.id;
    var token=req.body.token;
    if(!token){
        resp.render('step2',{
            error:"Token should not be blank"
        });
    }
    else{
    messagebird.verify.verify(id,token,function(err,response){
        if(err){
            console.log(err);
            response.render('step2',{
                error: err.errors[0].description,
                id: id,
            });
        } else {
            console.log(response);
            resp.render('step3');
        }
    });
}
});
app.listen(8080);