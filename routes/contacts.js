var express = require('express');
var router = express.Router();
var db = require('./database');
var MapboxClient = require('mapbox');
var GeocodeClient = new MapboxClient('pk.eyJ1IjoicGNoaGF0a3UiLCJhIjoiY2szYnhqdGxpMGc1azNucGlwdHBnejNxYiJ9.BTbhxr0Hg7oD68QPzs6dhA');

var ensureLoggedIn = function(req, res, next) {
  console.log(req.user);
	if ( req.user ) {
    console.log("forwarded to new page");
		next();
	}
	else {
    console.log("redirected back from contacts");
		res.redirect("/login");
	}
}

/* GET users listing. */
router.get('/',ensureLoggedIn, function(req, res, next) {
      //get all contacts from database and then render onto contacts.pug
      db.getcontacts(function(err, dbcontents){
      res.render('contacts',{dbcontents:dbcontents});
  });
});

router.post('/delete',ensureLoggedIn, function(req, res){
  console.log("this is what happended in contact");
  console.log(req.body.id);
  db.deletecontact(req.body.id, function(err, result){
    if (err) {
      console.log(err);
    }
    else
    {res.end();}
  });
});

router.post('/getSingleContact',ensureLoggedIn, function(req, res){
  
  db.getSingleContact(req.body.id, function(err, result){
    if(err){
      console.log(err);
    }
    else
    {
      console.log("This is in the contacts.,.vmsidhiv");
      console.log(result[0]);
      res.send(result);
    }
  });
});

router.post('/update',ensureLoggedIn, function(req, res){
  console.log("The post request to update was received in contact::update :::::::::::::::::::::");
  console.log(req.body.street);
  GeocodeClient.geocodeForward((req.body.street+', '+req.body.city+', '+req.body.state))
    .then(function(resn){
        console.log("GEocoding happenned");
        var data = resn.entity;
        if(data.features.length==0)
        {
            console.log('Alert - No address match found! latitude and longitude set to null!');
            req.body['longitude']= null;
            req.body['latitude']= null;
        }
        else
        {
            req.body['longitude']=data.features[0].geometry.coordinates[0];
            req.body['latitude']=data.features[0].geometry.coordinates[1];
        }
        //insert the singleContact into the database using the endpoint
    //MODULE database.addContact(singleContact);
    console.log("before insertion");
    
      db.updatecontact(req.body, function(err, result){
          console.log("after insertion");
          if(err)console.log(err);
          res.end(JSON.stringify({result: 'success'}));
      });
    })
    .catch(function(err){
        console.log("The catch function caught");
        console.log(err);

    });
  console.log("going to the request body for update:")
  console.log(req.body['_id']);

});



module.exports = router;
