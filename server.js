const express = require("express"); //import express lib
const mongoose = require("mongoose"); //import mongoos lib
const path = require("path"); //import path lib
const session = require("express-session");
const flash = require("connect-flash");

/* ===== Import Controllers Routers ===== */
const authRouters = require("./Controllers/authRoutings");
const speakersRouters = require("./Controllers/speakersRoutings");
const eventsRouters = require("./Controllers/eventsRoutings");
const adminRouters = require("./Controllers/adminRoutings");

/* ===== Server Host ===== */
const server = express(); //server express object
server.listen(8085, () => {
    console.log("Server Start .... ");
});

/* Mongoos Connect to database */
mongoose
    .connect("mongodb://localhost:27017/eventsDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("DataBase connected successfully...");
    })
    .catch(function(error) {
        console.log(error + "");
    });

/* ===== MiddleWares ===== */
// middleware print url,method
server.use((request, response, next) => {
    console.log("1st Middle Ware: " + request.method + " : " + request.url);
    next();
}); //print url&method middleware

//urlencoded to generate http post body object
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
//static for views files [set settings]
server.set("view engine", "ejs");
server.set("Views", path.join(__dirname, "Views"));

//static extentions
server.use(express.static(path.join(__dirname, "public")));
server.use(
    express.static(path.join(__dirname, "node_modules", "bootstrap", "dist"))
);
server.use(
    express.static(path.join(__dirname, "node_modules", "jquery", "dist"))
);
server.use(
    express.static(path.join(__dirname, "node_modules", "font-awesome"))
);

// set session secret settings
server.use(session({ secret: "abc123" }));
server.use(flash());

server.use(authRouters);

// session middleware
server.use((request, response, next) => {
    if (request.session.role) {
        response.locals.user_name = request.session.user_name;
        response.locals.user_id = request.session._id;
        response.locals.role = request.session.role;
        next();
    } else {
        response.redirect("/login");
    }
});

// server.use("/admin", adminRouters);
server.use("/speakers", speakersRouters);
server.use("/events", eventsRouters);

server.use((request, response) => {
    response.redirect("/login");
});
