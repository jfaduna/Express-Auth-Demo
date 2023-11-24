const express = require('express')
const app = express();
const User = require('./models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

mongoose.connect('mongodb://localhost:27017/authDemo');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

app.set('view engine', 'ejs')
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Welcome to Home page')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username: username,
        password: hash
    })
    await user.save();
    res.redirect('/')
})

app.get('/login', async (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    const passwordIsValid = await bcrypt.compare(password, user.password)
    if (passwordIsValid) {
        res.send('Successfully Logged In!')
    } else {
        res.send('Please try again')
    }
})

app.get('/secret', (req, res) => {
    res.send('You must be logged in to see this page.')
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
