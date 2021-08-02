
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Recipe = require('../models/recipe')
const Author = require('../models/author')
const uploadPath = path.join('public', Recipe.recipiesPhotos)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

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
router.post('/', upload.single('photo'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  const recipe = new Recipe({
    name: req.body.name,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    timeCount: parseInt(req.body.timeCount),
    imageName: fileName,
    description: req.body.description
  })
  try{
    const newRecipe = await recipe.save()
  // res.redirect(`authors/${newRecipe.id}`)
    res.redirect('recipies')
  } catch{ 
    if(recipe.imageName != null){
      removeRecipePhoto(recipe.imageName)
  }
    renderNewPage(res, recipe, true)
  }
  })


  async function removeRecipePhoto(fileName){
    fs.unlink(path.join(uploadPath, fileName), err =>{
      if(err) console.error(err)
    })
  }
  
async function renderNewPage(res, recipe, hasError = false){
  try{
    const authors = await Author.find({})
    const params = {
      authors: authors, 
      recipe: recipe
    }
    if (hasError) params.errorMessage = "Error creating a recipe"
    res.render('recipies/new', params )
  } catch{
    res.redirect('/recipies')
  }
}

module.exports = router 