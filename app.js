const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');
const _ = require('lodash')
const ejs = require('ejs')

app.set('view engine', 'ejs');
let port = 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

// Database>>>>
    // Connecting to database
    // mongodb+srv://panditmukki5:<password>@cluster0.qbfgn8a.mongodb.net/?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://panditmukki5:50abc%40MP@cluster0.qbfgn8a.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`CONNECTED TO MONGO!`);
    })
    .catch((err) => {
        console.log(`OH NO! MONGO CONNECTION ERROR!`);
        console.log(err);
    })

    const itemsSchema = new mongoose.Schema({
        name: String
    });

    const Item = mongoose.model("Item", itemsSchema);

    const item1 = new Item({
        name: "Welcome to todolist!"
    });

    const item2 = new Item({
        name: "Hit + to add new item"
    });

    const item3 = new Item({
        name: "<-- Hit this to delete an item"
    });

    const defaultItems = [item1, item2, item3];

    const listSchema = new mongoose.Schema({
        name: String,
        items: [itemsSchema]
    })

    const List = mongoose.mongoose.model("List", listSchema);
        

// ***************************** //


let today = new Date();
let options = {
    weekday: "long",
    day: "numeric",
    month:"long"
}

let currentDay = today.toLocaleDateString("en-US",options);
app.get("/", function (req, res) {

    Item.find({})
        .then(function (foundItems) {

            if(foundItems.length === 0) {
                
                Item.insertMany(defaultItems)
                .then(function () {
                    console.log("Successfully saved defult items to DB");
                })
                .catch(function (err) {
                    console.log(err);
                });
                res.redirect("/");
            } else{

                res.render('list', { listTitle: "currentDay" , newListItems: foundItems});
            }
        })
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if(listName === "currentDay") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({name: listName})
        .then(function (foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName)
        })
    }  
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
        .then(function (foundList) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save()
                res.redirect("/"+ customListName)
            } else {
                // Show existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items})
            }
        })

   
});

app.get("/about", function(req, res) {
    res.render("about");
})

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "currentDay") {
        
        Item.findByIdAndRemove(checkedItemId)
        .then(function () {
            console.log("Successfully deleted the item");
        res.redirect("/")
    })      
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
            .then(function(foundList){
                res.redirect("/" + listName)
            })
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running on Port 3000");
})