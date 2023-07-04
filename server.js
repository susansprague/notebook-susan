const express = require("express");
const path = require("path");
const util = require("util");
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const app = express();
const PORT=process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static("public"));

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"))
});
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/notes.html"))
});

function getNotes() {
    return readFile("db/db.json", "utf-8").then(rawNotes => [].concat(JSON.parse(rawNotes)));
}
app.get("/api/notes", (req,res) => {
    getNotes().then(notes => res.json(notes))
});
app.post("/api/notes", (req,res) => {
    getNotes().then(oldNotes => {
        console.log(oldNotes)
        const newNoteObj = {
            title: req.body.title, 
            text: req.body.text,
            id: uuidv4()
        }
        
        var newNoteArray = [...oldNotes, newNoteObj]
        writeFile("db/db.json", JSON.stringify(newNoteArray)).then(() => res.json({
            message: "success"
        }))
    })
})
app.delete("/api/notes/:id", (req,res) => {
    getNotes().then(oldNotes => {
        console.log(oldNotes)
        const filteredNotes = oldNotes.filter(note => note.id !==req.params.id)
        writeFile("db/db.json", JSON.stringify(filteredNotes)).then(() => res.json({
            message: "success"
        }))
    })
})
app.listen(PORT, () => console.log(`http://localhost:${PORT}`))