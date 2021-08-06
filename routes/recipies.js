
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const Recipe = require('../models/recipe')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//All  recipe route
router.get('/', async (req, res) =>{
  let query = Recipe.find()
  if (req.query.name != null && req.query.name != ''){
    query = query.regex('name', new RegExp(req.query.name, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try{
    const recipies = await query.exec()
    res.render('recipies/index', {
      recipies: recipies,
      searchOptions: req.query
    }) 
  } catch{
    res.redirect('/')
  }
})

//New recipe route
router.get('/new', async (req, res) =>{
  renderNewPage(res, new Recipe())
})


// Create recipe Route
router.post('/', async (req, res) => {
  const recipe = new Recipe({
    name: req.body.name,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    timeCount: req.body.timeCount,
    description: req.body.description
  })
  saveCover(recipe, req.body.image)

  try {
    const newRecipe = await recipe.save()
    res.redirect(`recipies/${newRecipe.id}`)
  } catch {
    renderNewPage(res, recipe, true)
  }
})

//Show a recipe route
router.get('/:id', async (req, res) => {
 try{
  const recipe = await Recipe.findById(req.params.id).populate('author').exec()
  res.render('recipies/showing', {recipe: recipe}) 
 }catch{
   res.redirect('/')
 }
})

router.get('/:id/edit', async (req, res) => {
  try{
   const recipe = await Recipe.findById(req.params.id)
   renderEditPage(res, recipe)
  }catch{
    res.redirect('/')
  }
 })

//Update a Recipe Route
 router.put('/:id', async (req, res) => {
  let recipe 
  try{
    recipe = await Recipe.findById(req.params.id)
    recipe.name = req.body.name,
    recipe.author = req.body.author,
    recipe.publishDate = new Date(req.body.publishDate),
    recipe.timeCount = req.body.timeCount,
    recipe.description = req.body.description

    if(req.body.image != null && req.body.image !== ''){
      saveCover(recipe, req.body.image)
    }
    await recipe.save()
    res.redirect(`/recipies/${recipe.id}`)

  }catch{
    if(recipe != null ){
      renderEditPage(res, recipe, true)
    }else{
      res.redirect('/')
    }
  }
})
  
// Delete a recipe page 
router.delete('/:id', async(req, res) => {
 let recipe 
  try{
    recipe = Recipe.findById(req.params.id)
    await recipe.remove()
    res.redirect('/recipies')
 }catch {
   if(book != null){
     res.render('recipies/show', {
       recipe: recipe,
       errorMessage: 'Could not remove recipe'
     })
   } else{
    res.redirect('/')
   }
 }
})
async function renderNewPage(res, recipe, hasError = false){
    renderPage(res, recipe, 'new', hasError)
}


async function renderEditPage(res, recipe, hasError = false){
    renderPage(res, recipe, 'edit', hasError)
}

async function renderPage(res, recipe, form, hasError = false){
  try{
    const authors = await Author.find({})
    const params = {
      authors: authors, 
      recipe: recipe
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Recipe'
      } else {
        params.errorMessage = 'Error Creating Recipe'
      }
    }
    res.render(`recipies/${form}`, params)
  } catch {
    console.log("I am inside a catch statement")
    res.redirect('/recipies')
  }
}




function saveCover(recipe, photoEncoded){
  if(photoEncoded == null) return 
  const photo = JSON.parse(photoEncoded)
  if(photo != null && imageMimeTypes.includes(photo.type)){
    recipe.photo = new Buffer.from(photo.data, 'base64')
    recipe.photoType = photo.type
  }
}


module.exports = router 