/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Harsh Trivedi Student ID: 125632216 Date: 14th November, 2023
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/
const legoData = require("./modules/legoSets");

const express = require('express');
const app = express();
const path = require('path');

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get("/lego/sets", async (req,res)=>{
  const theme = req.query.theme;
  if (theme) {
    const legoSetsByTheme = await legoData.getSetsByTheme(theme);
    if (legoSetsByTheme) {
      res.render("sets", {sets: legoSetsByTheme})
    } else {
      res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
    }
  } else {
      let sets = await legoData.getAllSets();
      res.render("sets", {sets: sets})
  }  
});

app.get("/lego/sets/:id", async (req,res)=>{
  try{
    const setNumber = req.params.id;
    let set = await legoData.getSetByNum(setNumber);
    res.render("set", {set: set})
  }catch(err){
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
  }
});

app.get('/lego/addSet', (req, res) => {
  const themes = legoData.getAllThemes();
  themes.then((themeData) => {
    res.render('addSet', { themes: themeData });
  });
});

app.post('/lego/addSet', (req, res) => {
  const setData = req.body;

  legoData.addSet(setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/editSet/:num', (req, res) => {
  const setNum = req.params.num;

  Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()])
    .then(([setData, themeData]) => {
      res.render('editSet', { themes: themeData, set: setData });
    })
    .catch((err) => {
      res.status(404).render('404', { message: err });
    });
});

app.post('/lego/editSet', (req, res) => {
  const setNum = req.body.set_num;
  const setData = req.body;

  legoData.editSet(setNum, setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/deleteSet/:num', (req, res) => {
  const setNum = req.params.num;

  legoData.deleteSet(setNum)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.use((req, res) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});