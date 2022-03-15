//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _= require("lodash")
// set up moongose section
const mongoose= require("mongoose");
const { redirect } = require("express/lib/response");

mongoose.connect("mongodb+srv://admin-lam:Test123@cluster0.velxy.mongodb.net/todolistDB",{useNewUrlParser: true}); // connect url
//create new schema
const itemsSchema = {
  name: String,
}
//create new model based on the schema
const Item = mongoose.model("item",itemsSchema);

const item1 = {
  name: "Welcome to your todolist"
};

const item2 = {
  name:"Hit the + button to add new item."
};

const item3 =  {
  name: "<--Hit this to delete an item"
}
// default items list for Today list
const defaultItems = [item1,item2,item3];
// create new schema name listSchema
const listSchema = {
  name: String,
  items: [itemsSchema] // embedded list
};
// created new model List for customListname
const List = mongoose.model("List", listSchema); // Used as databased for customListname


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const workItems = [];

app.get("/", function(req, res) {
  
 //
  Item.find({}, function(err,result){
    if (result.length===0) { // if liset item is emty=> insert
      //insert many records to Item model
        Item.insertMany(defaultItems, function (err){
          if(err) {
            console.log(err);
          }else {
            console.log("success added new records");
          }
        });
       res.redirect("/") // redirect to homepage"/"   
    } else { // if list item is not emty RENDER to the list
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  })
});


app.post("/", function(req, res){ // POST  handle when user submit

  const itemName = req.body.newItem; // tap in to the value of text input
  const listName = req.body.list; // tap into value of submit button also = listTitle
  
 // create new item( for one todo list) in order to added to stack later
  const item = new Item ({
    name: itemName
  })

  if( listName === "Today") { // if tittle page = Today , save list and redirect homepage
    item.save();
    res.redirect("/");
  } else { // if tittle page = customList
    List.findOne({name : listName}, function(err,foundList){ // find the customList
      foundList.items.push(item); // push new item to the listName (customList)
      foundList.save();
      res.redirect("/"+ listName);// redirect to home/customListPage

    })
  }
 
});
// handle "/delete" action of form (list.ejs)
app.post("/delete", function(req,res){ 
 // marked item which user choose to delete &store in variable
  const checkedItemId= (req.body.checkbox);
  // will store value of title list to determine which page
  const listName = req.body.listName; 
 
  if (listName === "Today") {console.log("right");} else{console.log("wrong");}
  
  if(listName === "Today") { // if today is homepage
    // find and remove records in defaut items list (homepage"Today")
    console.log("listname = true");
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err){
        console.log("success remove from Item list");
        res.redirect("/");
        } else { console.log("not found");}
      
    })

  } else { // if today is customListitem , remove item from CustomList database
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id:checkedItemId }}}, function (err,foundList){
      if(!err){ // if there is no error
        res.redirect("/"+ listName);
      }
    })

  };
   
})
// Express Route Parameters
app.get("/:customListName", function (req,res){

  const customListName =_.capitalize(req.params.customListName); // tranfer string item to capitalize form

// Model find record but only return  1 RECORD  
  List.findOne({name: customListName }, function(err, foundList){
    if(!err) {
      if(!foundList) {
        //Create a new list for customListName
        const list = new List ({
          name: customListName,
          items : defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);

      } else {
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
       }
      }  
  });
});
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});
// process.env.Port for HeroKu
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
