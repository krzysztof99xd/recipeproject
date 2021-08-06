const mongoose = require('mongoose')
const Recipe = require('./recipe')
const authorSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    }
})

authorSchema.pre('remove', function(next) {
    Recipe.find({author: this.id}, (err, recipies) => {
        if(err){
            next(err)
        } else if (recipies.length > 0) {
            next (new Error('This author has still recipies'))
        }else{
            next()
        }
    })
})
module.exports = mongoose.model('Author', authorSchema)