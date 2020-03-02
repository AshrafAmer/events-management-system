const express = require("express"); //import express library
const eventsRoutings = express.Router(); //eventsRoutings Router object
const mongoose = require("mongoose"); //import mongoose
require("./../Models/eventsModel"); //import speakers Schema
require("./../Models/declineEventsModel"); //import speakers Schema
const path = require("path"); //import path lib

// compile our model
let events = mongoose.model("events");
let peakers = mongoose.model("speakers");
let decline = mongoose.model("decline");

eventsRoutings.get("/list", (request, response) => {
    if (request.session.role) {
        peakers
            .find({})
            .then(data => {
                response.locals.Allspeakers = data;
            })
            .catch(error => {
                response.render("error/index.ejs");
            });

        if (request.session.role == "admin") {
            events
                .find({})
                .populate({ path: "mainSpeaker otherSpeakers" })
                .then(data => {
                    response.render("events/events.ejs", { eventsData: data });
                })
                .catch(error => {
                    response.render("error/index.ejs");
                });
        } else {
            events
                .find({
                    $or: [
                        { mainSpeaker: request.session._id },
                        {
                            otherSpeakers: {
                                $elemMatch: { $eq: request.session._id }
                            }
                        }
                    ]
                })
                .populate({ path: "mainSpeaker otherSpeakers" })
                .then(data => {
                    response.render("speakers/home.ejs", { eventsData: data });
                })
                .catch(error => {
                    response.render("error/index.ejs");
                });
        }
    } else {
        response.redirect("/login");
    }
}); //list ==> get

eventsRoutings.post("/decline", (request, response) => {
    let declineEvent = new decline(request.body); //get body http request
    declineEvent._id = declineEvent.user_id + declineEvent.event_id;
    if (request.body.main_speaker == declineEvent.user_id) {
        declineEvent.type = "main Speaker";
        declineEvent
            .save()
            .then(data => {
                events
                    .update(
                        { _id: declineEvent.event_id },
                        {
                            $set: { mainSpeaker: 0 }
                        },
                        { multi: true }
                    )
                    .then(data => {
                        response.redirect("/events/list");
                    })
                    .catch(error => {
                        response.render("error/index.ejs");
                    });
            })
            .catch(error => {
                response.render("error/index.ejs");
            });
    } else {
        declineEvent.type = "Other Speaker";
        declineEvent
            .save()
            .then(data => {
                events
                    .update(
                        { _id: declineEvent.event_id },
                        {
                            $pull: {
                                otherSpeakers: declineEvent.user_id
                            }
                        },
                        { multi: true }
                    )
                    .then(data => {
                        response.redirect("/events/list");
                    })
                    .catch(error => {
                        response.render("error/index.ejs");
                    });
            })
            .catch(error => {
                response.render("error/index.ejs");
            });
    }
}); // decline event post

// check session roles
eventsRoutings.use((request, response, next) => {
    if (request.session.role == "admin") {
        next();
    } else {
        response.redirect("/login");
    }
});

eventsRoutings.post("/add", (request, response) => {
    let addNewEvent = new events(request.body); //get body http request
    console.log(addNewEvent);
    addNewEvent
        .save()
        .then(data => {
            response.redirect("/events/list");
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); //add ==> post

eventsRoutings.post("/update", (request, response) => {
    let updateEvent = request.body; //get body http request
    console.log(updateEvent);
    events
        .update({ _id: updateEvent._id }, { $set: updateEvent })
        .then(data => {
            response.redirect("/events/list");
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); //update ==> post

eventsRoutings.post("/delete", (request, response) => {
    console.log(request.body);
    events
        .remove({ _id: request.body._id })
        .then(data => {
            //response.redirect("/events/list");
            response.send("OK");
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); //delete ==> get

eventsRoutings.get("/decline", (request, response) => {
    decline
        .find({})
        .populate({ path: "user_id event_id" })
        .then(data => {
            peakers
                .find({})
                .then(speakers => {
                    response.locals.Allspeakers = speakers;
                    response.render("events/decline_events.ejs", {
                        eventsData: data
                    });
                })
                .catch(error => {
                    response.render("error/index.ejs");
                });
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); // decline event get

eventsRoutings.post("/declineRemove", (request, response) => {
    decline
        .remove({ _id: request.body._id })
        .then(data => {
            events
                .remove({ _id: request.body.event_id })
                .then(data => {
                    //response.redirect("/events/list");
                    response.send("OK");
                })
                .catch(error => {
                    response.render("error/index.ejs");
                });
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); // delete decline events

eventsRoutings.post("/declineUpdate", (request, response) => {
    decline
        .remove({ _id: request.body.decline_id })
        .then(data => {
            events
                .update({ _id: request.body._id }, { $set: request.body })
                .then(data => {
                    response.redirect("/events/list");
                })
                .catch(error => {
                    response.render("error/index.ejs");
                });
        })
        .catch(error => {
            response.render("error/index.ejs");
        });
}); // update decline events
module.exports = eventsRoutings;
