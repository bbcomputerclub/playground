const path = require("path");
const fs = require("fs");
const express = require("express");
const exec = require("child_process").exec;

try {
	fs.mkdirSync(path.join(__dirname, "files"));
} catch(err) {}

try {
	fs.mkdirSync(path.join(__dirname, "downloads"));
} catch(err) {}

function createId() {
	var id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
	if (fs.existsSync(id)) {
		return createId();
	}
	return id;
}

const app = express();
app.use(express.text({
	type: "*/*"
}));

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "index.html"));
})
app.get("/style.css", function(req, res) {
	res.sendFile(path.join(__dirname, "style.css"));
})
app.post("/new", function(req, res) {
	const id = createId();
	fs.mkdir(path.join(__dirname, "files", id), (err) => {
		if (err != null) {
			console.error(err);
			res.sendStatus(500);
		} else {
			res.send(id);
		}
	});
});
app.get("/project/:id", function(req, res) {
	fs.readdir(path.join(__dirname, "files", req.params.id), function(err, files) {
		if (err != null) {
			console.error(err);
			res.status(404).json({
				"error": String(err)
			});
		} else {
			res.json({
				"id": req.params.id,
				"files": files
			});
		}
	});
});
app.get("/files/:id/:file", function(req, res) {
	res.sendFile(path.join(__dirname, "files", req.params.id, req.params.file));
});
app.post("/files/:id/:file", function(req, res) {
	fs.writeFile(path.join(__dirname, "files", req.params.id, req.params.file), req.body, function(err) {
		if (err) {
			console.error(err);
			res.sendStatus(404);
		} else {
			res.sendStatus(200);
		}
	});
});
app.get("/download/:id", function(req, res) {
	fs.readdir(path.join(__dirname, "files", req.params.id), function(err, files) {
		if (err != null) {
			res.sendStatus(404);
		} else {
			var name = "play-" + new Date().getTime();
			if (files.length == 1) {
				var ext = path.extname(files[0]);
				res.download(path.join(__dirname, "files", req.params.id, files[0]), name + ext);
			} else {
				var archive_path = path.join(__dirname, "downloads", req.params.id + ".zip");
				exec("zip -j " + archive_path + " " + files.map(function(filename) { 
					return path.join(__dirname, "files", req.params.id, filename);
				}).join(" "));
				res.download(archive_path, name + ".zip");
			}
		}
	});
});

var port = process.env.PORT;
if (!port) {
	port = "8000";
}
app.listen(port);
