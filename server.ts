const path = require("path");
const fs = require("fs");
const express = require("express");

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
	const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
	fs.mkdir(path.join(__dirname, id), (err) => {
		if (err != null) {
			console.error(err);
			res.sendStatus(500);
		} else {
			res.send(id);
		}
	});
});
app.get("/project/:id", function(req, res) {
	if (fs.existsSync(path.join(__dirname, req.params.id))) {
		fs.readdir(path.join(__dirname, req.params.id), function(err, files) {
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
	} else {
		res.sendStatus(404);
	}
});
app.get("/files/:id/:file", function(req, res) {
	res.sendFile(path.join(__dirname, req.params.id, req.params.file));
});
app.post("/files/:id/:file", function(req, res) {
	fs.writeFile(path.join(__dirname, req.params.id, req.params.file), req.body, function(err) {
		if (err) {
			console.error(err);
			res.sendStatus(404);
		} else {
			res.sendStatus(200);
		}
	});
});

var port = process.env.PORT;
if (!port) {
	port = "8000";
}
app.listen(port);
