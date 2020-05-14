var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
var fs = require("fs");
var youtube = require("youtube-dl");
var dotenv = require("dotenv");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
dotenv.config();
// console.log(result);
var cwd = __dirname;



app.get("/", function(req, res) {
    res.render("home");
});

app.post("/search", function(req, res) {
    var query = req.body.query;
    res.redirect("/search/" + query);
});

app.get("/search/:query", function(req, res) {
    var query = req.params.query;
    var finalQuery = "";
    var i = 0;
    for (i = 0; i < query.length; i++) {
        if (query[i] !== " ") {
            finalQuery += query[i];
        }
        else {
            finalQuery += "+";
        }
    }

    // console.log(process.env.APICREDENTIAL);
    request("https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + finalQuery + "&key=" + process.env.APICREDENTIAL,
    function(error, response, body) {
    	if (error) {
    		console.log(error);
    	}
        var data = JSON.parse(body);
        // res.send(data);
        console.log(data);
        res.render("index", {data: data});
    }
);
});

app.get("/download/:videoUrl", function(req, res) {
    // console.log(cwd);
    // console.log("https://www.youtube.com/watch?" + req.params.videoUrl);
    const video = youtube("http://www.youtube.com/watch?v=" + req.params.videoUrl, 
    ["--format=18"],
    {cwd: cwd});
    // console.log(video);
    video.on("info", function(info) {
        console.log("Download Started");
        if (info.track === null) {
            track = String(info.title + ".mp4");
        }
        else {
            track = String(info.track + ".mp4");
        }
        console.log(track);

        video.pipe(fs.createWriteStream(track));

        res.redirect("/started");
    });;
});

app.get("/started", function(req, res) {
    res.render("started");
});

app.listen(8080, function(req, res) {
    console.log("The Music App has started!");
});
