let mymap;
L.mapbox.accessToken = 'pk.eyJ1IjoicGNoaGF0a3UiLCJhIjoiY2szYnhqdGxpMGc1azNucGlwdHBnejNxYiJ9.BTbhxr0Hg7oD68QPzs6dhA'; // you only need to do this once...
let geocoder = L.mapbox.geocoder('mapbox.places');
let searchlocation;
var listOfMarkers = {};
var updateOrDeleteId;

console.log(x);// x contains the list of contact JSON objects

$("#FirstInputBox").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#tableBody tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});

$("#LastInputBox").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#tableBody tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});

const marker = {
    icon: L.mapbox.marker.icon({
              'marker-size': 'large',
              'marker-color': '#fa0'
          })};


const addMarker = (data) => {
   // if (err ) return console.error("ugh");
    if (data.latlng) 
    {console.log(data.latlng);
                var marker = L.marker(data.latlng, marker).bindTooltip(data.contactInfo).addTo(mymap);
                mymap.flyTo(data.latlng,8);
                listOfMarkers[data['_id']]=marker;
    }
    else console.log("Place couldnt be located");
}


const init_map = () => {    
    mymap = L.mapbox.map('mapid', 'examples.map-h67hf2ic').setView([40.7648, -73.9808], 13);
    x.forEach(function(contact){
        console.log("latitude for each  :: "+ contact.latitude);
        data={};
        data.latlng=[];
        data.latlng.push(contact.latitude);
        data.latlng.push(contact.longitude);
        data.contactInfo=contact.firstName+' '+contact.lastName+'   '+contact.phone+'   '+contact.email
        data['_id']=contact['_id'];
        addMarker(data);
    });
}

function populateUpdatePage(contactToUpdate)
{
    console.log("This is on the populate page: :::: ID::::");
    console.log(contactToUpdate['_id']);
    console.log("::::: :::::");

    $('#update input[type="radio"][value="'+contactToUpdate.prefix+'"]').prop("checked", true);

    $('#update input[name="firstName"]').val(contactToUpdate.firstName);

    $('#update input[name="lastName"]').val(contactToUpdate.lastName);
    $('#update input[name="street"]').val(contactToUpdate.street);
    $('#update input[name="city"]').val(contactToUpdate.city);
    $('#update input[name="zip"]').val(contactToUpdate.zip);
    $('#update input[name="phone"]').val(contactToUpdate.phone);
    $('#update input[name="email"]').val(contactToUpdate.email);

    $('#update select option[value="'+contactToUpdate.state+'"]').attr("selected", "selected");

    if(contactToUpdate.contactByPhone=='Yes' && contactToUpdate.contactByEmail=='Yes' && contactToUpdate.contactByMail=='Yes')
    {
        $('#update input[value="contactByAny"]').prop("checked",true);
    }
    else
    {
        if(contactToUpdate.contactByPhone=='Yes')
            $('#update input[name="contactByPhone"]').prop("checked",true);
        if(contactToUpdate.contactByEmail=='Yes')
            $('#update input[name="contactByEmail"]').prop("checked",true);
        if(contactToUpdate.contactByMail=='Yes')
        $('#update input[name="contactByMail"]').prop("checked",true);
        //uncheck any box
        $('#update input[name="contactByAny"]').prop("checked",false);
    }

}

$(document).ready(function() {
    readContacts();
    init_map();

    $('tr').click(function(){
            var searchId = $(this).attr("data-contactId");
            for(var i = 0; i < x.length; i++)
            {
              if(x[i]['_id'] == searchId)
              {
                  mymap.flyTo([x[i].latitude,x[i].longitude],13);
                  break;
              }
            }
    });

//--------------------------------------------------------------------------------------------------------------------------------------------------

    //when any update button is clicked
        //show the update section
        //populate the form
        //update all
    $(".updateButton").click(function(){
        updateOrDeleteId = $(this).parent().parent().attr("data-contactId");
        console.log(updateOrDeleteId);
        for(var i = 0; i < x.length; i++)
        {
            if(x[i]['_id'] == updateOrDeleteId)
            {
                //populate values
                populateUpdatePage(x[i]);
                break;
            }
        }
        updateContacts();
    });
    //confirmation button on confirm page
    $("#confirmUpdate").click(function(){
        //get form data
        var updateData = {};
        var inputs = $('#'+'updateForm').serializeArray();
        $.each(inputs, function (i, input) {
            updateData[input.name] = input.value;
        });
        updateData['_id']=updateOrDeleteId;
        if(updateData.contactByAny =="Any")
        {
            updateData["contactByPhone"] = "Yes";
            updateData["contactByMail"] = "Yes";
            updateData["contactByEmail"] = "Yes";
            delete updateData.contactByAny;
        }
        else
        {
            if(updateData.contactByPhone != "Phone")
            updateData["contactByPhone"] = "No";
            else
            updateData["contactByPhone"] = "Yes";
            if(updateData.contactByMail != "Mail")
            updateData["contactByMail"] = "No";
            else
            updateData["contactByMail"] = "Yes";
            if(updateData.contactByEmail != "Email")
            updateData["contactByEmail"] = "No";
            else
            updateData["contactByEmail"] = "Yes";
         }
        console.log("checking if value stored correctly in form:::::::::::::::::::::::::::::::::::::::::::::::::::");
        console.log(JSON.parse(JSON.stringify(updateData)));

        //make an ajax call to process
        var ajaxUpdate = $.post('contacts/update', updateData);
        ajaxUpdate.done(function(data){
            console.log("done updating in database.");
            $("tr[data-contactId='" + updateOrDeleteId +"'] td").remove(".removeOnUpdate");
            var jax=$.post('contacts/getSingleContact',{id:updateOrDeleteId});
            jax.done(function(dataresp){
                
                console.log("This is the client-side javascript ajax return value");
                console.log(dataresp);
                console.log(dataresp[0]);
                console.log(dataresp[0].firstName);
                for(var i = 0; i < x.length; i++) {
                    if(x[i]['_id'] == updateOrDeleteId) {
                        x[i]=dataresp[0];
                        break;
                    }
                }
                console.log("Marker::::::::::::::::::::::::::::::::::::::::::::");
                console.log(listOfMarkers[updateOrDeleteId]);
                mymap.removeLayer(listOfMarkers[updateOrDeleteId]);
                delete listOfMarkers[updateOrDeleteId];
                let markerdata={}
                markerdata['_id']=dataresp[0]['_id'];
                markerdata.latlng=[dataresp[0].latitude,dataresp[0].longitude];
                markerdata.contactInfo=dataresp[0].firstName+' '+dataresp[0].lastName+'   '+dataresp[0].phone+'   '+dataresp[0].email;
                addMarker(markerdata);
                $("tr[data-contactId='" + updateOrDeleteId +"']").prepend(
                    "<td>"+dataresp[0].prefix+"</td><td>"+dataresp[0].firstName+"</td><td>"+dataresp[0].lastName+"</td><td>"+dataresp[0].street+"</td><td>"+dataresp[0].city+"</td><td>"
                    +dataresp[0].state+"</td><td>"+dataresp[0].zip+"</td><td>"+dataresp[0].phone+"</td><td>"+dataresp[0].email+"</td><td>"
                    +dataresp[0].contactByPhone+"</td><td>"+dataresp[0].contactByMail+"</td><td>"+dataresp[0].contactByEmail/*+
                    "</td><td><button class='updateButton' type='button' name='update' value='update'>update</button></td>"+
                    "<td><button class='deleteButton' type='button' name='delete' value='delete'>delete</button></td>"*/
                );
                readContacts();
            });
        });
    });

    //cancel page
    $("#cancelUpdate").click(function(){
        readContacts();
    });
//--------------------------------------------------------------------------------------------------------------------------------------------------
    //when any delete button is clicked
        //hide all: show delete section
        // if confirm button is pressed:                send ajax request
        // if cancel button is pressed: hide all:       show read section
    $(".deleteButton").click(function(){
        updateOrDeleteId = $(this).parent().parent().attr("data-contactId");
        console.log("just to see if the id was found in the first place");
        console.log(updateOrDeleteId);
        for(var i = 0; i < x.length; i++)
        {
            if(x[i]['_id'] == updateOrDeleteId)
            {
                $("#confirmDelete").prepend("<p>"+x[i].phone+' '+x[i].email+"</p>")
                $("#confirmDelete").prepend("<p>"+x[i].street+' '+x[i].city+' '+x[i].state+' '+x[i].zip+"</p>")
                $("#confirmDelete").prepend("<p>"+x[i].prefix+' '+x[i].firstName+' '+x[i].lastName+"</p>")
                
                break;
            }
        }
        deleteContacts();
    });
    
    $('#confirmDeletion').click(function(){
        //send ajax request---- to delete document stored in updateOrDeleteId--> variable
        console.log("This is the id before ajax is called:::::::::::::::::");
        console.log(updateOrDeleteId);
            var ajaxpost = $.post('/contacts/delete',{id:updateOrDeleteId});
            ajaxpost.done(function(){
                console.log("the done function was called");
                $('p').remove();                                   
                readContacts();
                //$('[data-contactId="${updateOrDeleteId}"]').remove();
                //$('tr').filter('[data-contactId=updateOrDeleteId]').remove();
                $("tr[data-contactId='" + updateOrDeleteId +"']").remove();
                for(var i = 0; i < x.length; i++) {
                    if(x[i]['_id'] == updateOrDeleteId) {
                        x.splice(i, 1);
                        break;
                    }
                }
                mymap.removeLayer(listOfMarkers[updateOrDeleteId]);
                mymap.setView([40.7128,-74.0060],6);
            });
    });

    $('#cancelDeletion').click(function(){
        $('p').remove();
        readContacts();
        
    });

});
//--------------------------------------------------------------------------------------------------------------------------------------------------

function readContacts(){
    mask(true, false, false);
}

function updateContacts(){
    mask(false, false, true);
}

function deleteContacts(){
    mask(false, true, false);
}

const mask = (readpage, deletepage, updatepage) => {
        readpage ? $('#read').show() : $('#read').hide();
        deletepage ? $('#confirmDelete').show() : $('#confirmDelete').hide();
        updatepage ? $('#update').show() : $('#update').hide();
}