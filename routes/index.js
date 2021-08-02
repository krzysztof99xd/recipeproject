const express = require('express')
const router = express.Router()
const Recipe = require('../models/recipe')

router.get('/', async (req, res) =>{
    let recipies
    try{
        recipies = await Recipe.find().sort({createdAt: 'desc'}).limit(5).exec()
    }catch{
        recipies = []
    }
    res.render('index', {recipies: recipies})
})

module.exports = router 