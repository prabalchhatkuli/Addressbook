var express = require('express');
var router = express.Router();

//insert this into the database route
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
// Connection URL
var url = 'mongodb://localhost:27017/contacts';
// Database Name
var dbName = 'contactList';
var collectionName = 'contacts';
//------------------------------------------------test connection--------------------
const startConnection = () => {
	try{
			MongoClient.connect(url, function(err, client) {
			if (err) throw err;
			console.log("Connected successfully to server");

			db = client.db(dbName);
			collection1 = db.collection(collectionName);
		});
	}
	catch(ex)
	{
		console.error(ex);
	}
};
//-------------------------------------------------add contact------------------------------------
const addContact = (contact, returnfunc) =>{  // be aware that single contact refers to a single JSON object
	for(var key of Object.keys(contact))
	{
		if(contact[key]==undefined){contact[key] = '*';}		//latitude and longitude not added
	}
	//get latitude and longitude and add as property


	collection1.insertOne(contact, function(err, result){
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log('ID returned: '+ result.insertedId);
			console.log('data processsed and stored');
			returnfunc(err, true);
		}
    })
};
//-------------------------------------------------get all contact(for contact page)----------------------
const getcontacts = (returnfunc) =>{
	collection1.find().toArray(function(err,result){	//result contains an array of the datasets
		if(err)
		{
			console.log(err);
			return;
		}
		else if(result.length ===0)
		{
			console.log("The following number of datasets were returned:"+result.length);
		}
		else
		{
			console.log("The following number of datasets were returned:"+result.length);
			returnfunc(err, result);
		}

	});

};
//-----------------------------------------------------delete a contact given the id---------------------------
const deletecontact = (contactId, returnfunc) =>{
	/*console.log("this is what happended in database");
	console.log(contactId);
	console.log('deleting contact server:')
	collection1.deleteOne({'_id':ObjectID(contactId)}, function(err, result){
		if(err){
			console.log(err);
		}
		returnfunc(null, result);
	});*/
	//db.collection('contacts')
	collection1.deleteOne({"_id": ObjectID(contactId)}, //change to collection1
        function (err, result) {
			//console.log("in d b" + result);
			console.log("completed");
            returnfunc(err,result);
        }
    )
}
//----------------------------------------------------update a contact--------------------------------------------
const updatecontact = (updateValue, returnfunc) =>{
	console.log("trying to update in database");

	collection1.updateOne({"_id":ObjectID(updateValue["_id"])},
	{$set:{"prefix":updateValue.prefix,
		"firstName":updateValue.firstName,
		"lastName":updateValue.lastName,
		"street":updateValue.street,
		"city":updateValue.city,
		"state":updateValue.state,
		"zip":updateValue.zip,
		"phone":updateValue.phone,
		"email":updateValue.email,
		"contactByPhone":updateValue.contactByPhone,
		"contactByMail":updateValue.contactByMail,
		"contactByEmail":updateValue.contactByEmail,
		"longitude":updateValue.longitude,
		"latitude": updateValue.latitude
	}}, function(err, result){
		returnfunc(err, result);
	});
}

//----------------------------------------------------------get single contact based on the id-----------------------------------
const getSingleContact = (findId, returnfunc)=>{
	collection1.find({"_id":ObjectID(findId)}).toArray(function(err,docs){
		if(err)console.log(err);
		singleData=[]
		console.log("The following data was retruned as a result of the get in database");
		
			singleData.push(docs[0]);
		console.log(docs[0]);
		returnfunc(err, singleData);
	});
}

//module to start a connection
exports.startConnection = startConnection; // this should be called only once when the user gets authorized
//module to add contact to the database
exports.addContact = addContact;
//module to get all contacts from the database
exports.getcontacts = getcontacts;
//module to delete a database entry
exports.deletecontact = deletecontact;
//module to update a data entry
exports.updatecontact = updatecontact;
//module to return a single contact
exports.getSingleContact = getSingleContact;