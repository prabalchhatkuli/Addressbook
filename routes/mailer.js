var express = require('express');
var router = express.Router();
var db = require('./database');
var MapboxClient = require('mapbox');
var GeocodeClient = new MapboxClient('pk.eyJ1IjoicGNoaGF0a3UiLCJhIjoiY2szYnhqdGxpMGc1azNucGlwdHBnejNxYiJ9.BTbhxr0Hg7oD68QPzs6dhA');


var startMailer = function(req, res, next) {
 
    console.log("loaded main  page");
    res.render('mailer', { });
}

var received = function(req, resn, next){
	console.log("the contact information was sent via post");
	//create a json object containing all the fields of the resonse
	// the object could be made a template for all other places where it could be used.
    console.log("point 2");
	var postBody = req.body;
    console.log("point 1");
    
	var singleContact = {
		'prefix': postBody.prefix,
		'firstName' : postBody.firstName,
		'lastName': postBody.lastName,
		'street': postBody.street,
		'city': postBody.city,
		'state': postBody.state,
		'zip': postBody.zip,
		'phone': postBody.phone,
		'email': postBody.email
    };

    //check if the slect boxes are on or not
		if(postBody.contactByAny =="Any")
        {
            singleContact["contactByPhone"] = "Yes";
            singleContact["contactByMail"] = "Yes";
            singleContact["contactByEmail"] = "Yes";
        }
        else
        {
            if(postBody.contactByPhone != "Phone")
                singleContact["contactByPhone"] = "No";
            else
                singleContact["contactByPhone"] = "Yes";
            if(postBody.contactByMail != "Mail")
                singleContact["contactByMail"] = "No";
            else
                singleContact["contactByMail"] = "Yes";
            if(postBody.contactByEmail != "Email")
                singleContact["contactByEmail"] = "No";
            else
                singleContact["contactByEmail"] = "Yes";
         }

    GeocodeClient.geocodeForward((singleContact.street+', '+singleContact.city+', '+singleContact.state))
    .then(function(res){
        var data = res.entity;
        if(data.features.length==0)
        {
            console.log('Alert - No address match found! latitude and longitude set to null!');
            singleContact['longitude']= null;
            singleContact['latitude']= null;
        }
        else
        {
            singleContact['longitude']=data.features[0].geometry.coordinates[0];
            singleContact['latitude']=data.features[0].geometry.coordinates[1];
        }
        //insert the singleContact into the database using the endpoint
    //MODULE database.addContact(singleContact);
    console.log("before insertion");
    console.log(JSON.parse(JSON.stringify(singleContact)));
    db.addContact(singleContact, function(err, result){
        console.log("after insertion");
        console.log(JSON.parse(JSON.stringify(singleContact)));
        resn.render('thanks', {singleContact:singleContact});
    });
    })
    .catch(function(err){
        console.log(err);

    });
    
}

/* GET home page. */
router.get('/', startMailer);
router.get('/index', startMailer);
router.get('/mailer', startMailer);
router.post('/mailer', received);

module.exports = router;
