if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()

  app.use(express.static(__dirname + '/template'));
  
  app.get('/', (req, res) => {
    res.render('index.ejs')
  })
  
  app.get('/login', (req, res) => {
    res.render('login.ejs')
  })
  

  app.get('/register', (req, res) => {
    res.render('register.ejs')
  })
  
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  

  
  app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
  }); 
  