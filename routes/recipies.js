
const express = require('express')
const router = express.Router()
// const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Recipe = require('../models/recipe')
const Author = require('../models/author')
// const uploadPath = path.join('public', Recipe.recipiesPhotos)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype))
//   }
// })

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
    const newBook = await recipe.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`recipies`)
  } catch {
    renderNewPage(res, recipe, true)
  }
})


  // async function removeRecipePhoto(fileName){
  //   fs.unlink(path.join(uploadPath, fileName), err =>{
  //     if(err) console.error(err)
  //   })
  // }
  
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

function saveCover(recipe, photoEncoded){
  if(photoEncoded == null) return 
  const photo = JSON.parse(photoEncoded)
  if(photo != null && imageMimeTypes.includes(photo.type)){
    recipe.photo = new Buffer.from(photo.data, 'base64')
    recipe.photoType = photo.type
  }
}


module.exports = router 