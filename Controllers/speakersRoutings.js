const express = require("express"); //import express library
const speakersRoutings = express.Router(); //speakersRoutings Router object
const mongoose = require("mongoose"); //import mongoose
const path = require("path"); //import path lib
const multer = require("multer"); //upload images
require("./../Models/spreakersModel"); //import speakers Schema

let speaker = mongoose.model("speakers"); // compile our model

// The disk storage engine gives you full control on storing files to disk.
// Ref: https://www.npmjs.com/package/multer
let date = new Date();
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "..", "public", "profiles"));
    },
    filename: function(req, file, cb) {
        cb(
            null,
            file.fieldname +
                "-" +
                date.getFullYear() +
                "" +
                date.getMonth() +
                date.getDay() +
                date.getHours() +
                date.getMinutes() +
                ".jpg"
        );
    }
});

let upload = multer({ storage: storage });

speakersRoutings.get("/profile/:_id", (request, response) => {
    speaker
        .find({ _id: request.params._id })
        .then(data => {
            response.render("profiles/speaker.ejs", { speaker: data });
        })
        .catch(error => {
            response.redirect("/speakers/list");
        });
}); //profile ==> get

// update profile
speakersRoutings.post(
    "/editProfile",
    upload.single("image"),
    (request, response) => {
        let updateSpeaker = request.body; //get body http request
        updateSpeaker.image =
            "image-" +
            date.getFullYear() +
            "" +
            date.getMonth() +
            date.getDay() +
            date.getHours() +
            date.getMinutes() +
            ".jpg";
        console.log(updateSpeaker);
        speaker
            .update({ _id: updateSpeaker._id }, { $set: updateSpeaker })
            .then(data => {
                response.redirect("profile/" + updateSpeaker._id);
            })
            .catch(error => {
                response.render("error/index.ejs");
            });
    }
); //profile ==> get

// check session roles
speakersRoutings.use((request, response, next) => {
    if (request.session.role == "admin") {
        next();
    } else {
        response.redirect("/login");
    }
});

speakersRoutings.get("/admin", (request, response) => {
    response.render("profiles/admin");
}); //login ==> get

speakersRoutings.get("/list", (request, response) => {
    speaker
        .find({})
        .then(data => {
            response.render("speakers/speakers.ejs", { speakers: data });
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); //list ==> get

speakersRoutings.post("/update", (request, response) => {
    let updateSpeaker = request.body; //get body http request
    console.log(updateSpeaker);
    speaker
        .update({ _id: updateSpeaker._id }, { $set: updateSpeaker })
        .then(data => {
            response.redirect("list");
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); //update ==> post

speakersRoutings.post("/delete", (request, response) => {
    console.log(request.body);
    speaker
        .remove({ _id: request.body._id })
        .then(data => {
            response.send("OK");
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); //delete ==> get

module.exports = speakersRoutings;
