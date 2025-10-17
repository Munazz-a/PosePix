const express = require('express');
const route = express.Router();
const cloudinary = require('../config/cloudinary.js');

const picture = require('../models/photomodel.js');

route.post('/', async(req, res) => {
    try{
        const { image, poseType, sessionId } = req.body;
        if(!sessionId){
            return res.status(500).json({ success : false, error : "sessionId is required"})
        }
        // upload to cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder : 'posePix',
            type : 'authenticated',
            access_mode : 'authenticated'
        })
        // Saving to mongoDB
        const photo = new picture({
            url : result.secure_url, 
            poseType, 
            sessionId,
            public_id : result.public_id,
            
        })
        const savedPhoto = await photo.save();
        console.log('Saved in MongoDB');
        // response back to frontend
        res.json({Success : true, savedPhoto});
    } catch (err){
        res.status(500).json({Success : false, error : err.message});
    }
})

route.get('/', async(req, res) =>{
    try{
        const { sessionId } = req.query;
        if(!sessionId){
            return res.status(500).json({ success : false, error : "sessionId is required"})
        }
        const photos = await picture.find({ sessionId }).sort({ createdAt : 1 });
        res.json({ Success : true, photos});
    } catch(err){
        res.status(500).json({ Success : false, error : err.message});
    }
})

route.delete('/:id', async(req, res) => {
    try{
        await picture.findByIdAndDelete(req.params.id);
        console.log('Deleted from MongoDB');

        res.json({ Success : true, message : "photo deleted"})
    } catch (err) {
        res.status(500).json({ Success : false, error : "error deleting photo"})
    }
})

route.put("/:id", async(req, res) => {
    try{
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, message: "No image provided" });
        }

        const result = await cloudinary.uploader.upload(image, { folder : "posePix"})

        const updatePhoto = await picture.findByIdAndUpdate(
            req.params.id,
            { url : result.secure_url, public_id : result.public_id },
            { new : true }
        )
        if (!updatePhoto) {
            return res.status(404).json({ success: false, message: "Photo not found" });
        }
        res.json({ Success : true, updatePhoto})
    } catch(err){
        res.status(500).json({ Success : false, error : err.message})
    }
})

module.exports = route;