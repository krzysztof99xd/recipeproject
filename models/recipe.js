const mongoose = require('mongoose')
const path = require('path')
const recipiesPhotos = 'uploads/recipiesPhotos'
const recipeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    publishDate:{
        type: Date,
        required: true
    },
    timeCount:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    photo: {
        type: Buffer,
        required: true
    },
    photoType:{
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }

})

recipeSchema.virtual('recipePhotoPath').get(function(){
    if (this.photo != null && this.photoType != null){
        return `data:${this.photoType};charset=utf-8;base64,${this.photo.toString('base64')}`
    }
})

module.exports = mongoose.model('Recipe', recipeSchema)
// module.exports.recipiesPhotos = recipiesPhotos