const express = require('express'), mysql = require('mysql'), bodyparser = require('body-parser'), fileUpload = require('express-fileupload');

let port = process.env.port || 5000, app = express()

let config = {
    host: "localhost",
    user: "root",
    password: "",
    database: "student_database",
    charset: "utf8mb4",
    multipleStatement: true
}
let db = mysql.createPool(config)

app.listen(port, () => require("dns").lookup(require("os").hostname(), (err,addr,fam) => console.log(`http://${addr}:${port}`)))

app.use(express.static(`${__dirname}/public`))
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
app.use(fileUpload({
    createParentPath: true
}))

app.get("/",(req,res) => res.render("index.html"))

app.get("/main",(req,res) => res.sendFile(`${__dirname}/public/main.html`))

app.post("/user",(req,res) => {
    let { username, password } = req.body;
    let sql = `insert into account (username,password) values ('${username}','${password}')`;
    db.query(sql, err => err ? res.status(500).json(err) : res.redirect("/main"))
})

app.get("/user",(req,res) => {
    let sql = "select * from account"
    db.query(sql, (err,results) => err ? res.status(500).json(err) : res.json(results))
})

app.post("/student", (req,res) => {
    if(req.files){
        let { idno, lastname, firstname, course, level } = req.query, { webcam } = req.files;
        let stamp = `${Date.now()}${webcam.name}`

        webcam.mv(`./public/assets/images/${stamp}`)

        let sql = `insert into student (idno,lastname,firstname,course,level,image) values ('${idno}','${lastname}','${firstname}','${course}','${level}','./assets/images/${stamp}')`;
        db.query(sql, err => err ? res.status(500).json(err) : res.redirect("/main"))
    }
})

app.get("/student",(req,res) => {
    let sql = "select * from student"
    db.query(sql, (err,results) => err ?  res.status(500).json(err) : res.json(results))
})

app.put("/student/update",(req,res) => {
    let { idno, lastname, firstname, course, level } = req.body;
    let sql = `update student set lastname='${lastname}', firstname='${firstname}', course='${course}', level='${level}' where idno=${idno}`
    db.query(sql, err => err ? res.status(500).json(err) : res.json({"message":"Student updated!"}))
})

app.delete("/student/:id",(req,res) => {
    let sql = `delete from student where idno=${req.params.id}`
    db.query(sql, err => err ? res.status(500).json(err) : res.json({"message":"Student removed!"}))
    db.query('alter table student auto_increment=1')
})

app.post("/login",(req,res) => {
    let { username, password } = req.body;
    let sql = `select * from account where username='${username}' and password='${password}'`;
    if(username == "admin" && password == "user") res.redirect("/main")
    else{
        db.query(sql,(err,results) => {
            if(err) return res.status(500).json("Login Failed")
            else {
                if(results.length > 0) res.redirect("/main")
                else res.redirect("/?message=LOGIN FAILED")
            }
        })
    }
})