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
    req.session.user_id = user._id
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
        req.session.user_id = user._id
        res.redirect('/secret')
    } else {
        res.redirect('/')
    }
})

app.get('/secret', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('/login')
    } else {
        res.send('You must be logged in to see this page.')
    }
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
