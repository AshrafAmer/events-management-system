const express = require("express"); //import express library
const adminsRoutings = express.Router(); //adminsRoutings Router object

adminsRoutings.get("/profile", (request, response) => {
    response.render("profiles/admin.ejs");
}); //profile ==> get

module.exports = adminsRoutings;
