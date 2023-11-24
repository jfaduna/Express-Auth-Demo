const express = require('express')
const app = express();
const User = require('./models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('express-session')

mongoose.connect('mongodb://localhost:27017/authDemo');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

app.set('view engine', 'ejs')
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'samplesecret' }))

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    res.send('Welcome to Home page')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id
    res.redirect('/')
})

app.get('/login', async (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const validUser = await User.findAndValidate(username, password);
    if (validUser) {
        req.session.user_id = validUser._id
        res.redirect('/secret')
    } else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.get('/topsecret', requireLogin, (req, res) => {
    res.send('Top Secret')
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
