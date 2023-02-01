const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

var foodItems = [];
var foodItem = [];
var calories = [];
var dietLabels = [];
var energyCals = [];
var healthLabels = [];


// function to make array of data look user friendly
function fixList(arr, newArr) {
    for (var i = 0; i < arr.length; i++) {
        var newLabel = JSON.stringify(arr[i]).toLowerCase().replaceAll("\"", "").replaceAll("_", " ");
        var newLabel = newLabel.split(" ");
        for (var j = 0; j < newLabel.length; j++) {
            newLabel[j] = newLabel[j][0].toUpperCase() + newLabel[j].substr(1);

        }
        var newLabel = newLabel.join(" ");
        if (i > 0) {
            var newLabel = " " + newLabel
        }



        newArr.push(newLabel);
    }
}




app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");


})

app.post("/", (req, res) => {
    const appKey = "1cf857a505335a2a9cb6bc24181feeeb";
    const appId = "ceb32c1a";
    const url = "https://api.edamam.com/api/nutrition-data?app_id=" + appId + "&app_key=" + appKey + "&nutrition-type=logging&ingr=";
    const ingr = encodeURIComponent(req.body.ingredients);



    // https.get(url + ingr, function (response) {
    //     console.log(response.statusCode);
    // })


    fetch(url + ingr)
        .then((response) => response.json())
        .then((data) => {
            var calorie = data.calories;
            var dietLabel = data.dietLabels;
            var energyCal = data.totalNutrientsKCal.ENERC_KCAL.quantity;
            var healthLabel = data.healthLabels;


            //if loop to make sure ingredients were typed correctly and can be used, otherwise API won't be able to get data

            //if true, that means the food item was typed correctly and able generate data
            // console.log(data.ingredients[0].hasOwnProperty('parsed'));
            if (data.ingredients[0].hasOwnProperty('parsed')) {

                if (data.ingredients[0].parsed[0].measure == "serving") {
                    for (var i = 0; i < data.ingredients[0].parsed.length; i++) {
                        var food = data.ingredients[0].parsed[i].foodMatch;

                        foodItem.push(food);


                    }
                    fixList(foodItem, foodItems);
                }else {
                    foodItems = [];
                }




            } else {
                foodItems = [];
            }
            console.log(foodItems);




            fixList(dietLabel, dietLabels);
            fixList(healthLabel, healthLabels);
            calories.push(calorie);
            energyCals.push(energyCal);


            if (foodItems.length == 0) {
                foodItems = ["No Food"];
                calories = "No Calories";
                dietLabels = "No Labels";
                energyCals = "No Calories";
                healthLabels = "No Labels";
            }


            res.redirect("/info")

        });



})

app.get("/info", (req, res) => {
    res.render("analysis", {
        foodItems: foodItems,
        calorieCount: calories,
        dietLabels: dietLabels,
        energyCals: energyCals,
        healthLabels: healthLabels

    })
    foodItem = [];
    foodItems = [];
    calories = [];
    dietLabels = [];
    energyCals = [];
    healthLabels = [];
})






app.listen(3000, () => {
    console.log("Port 3000 server is running");
})