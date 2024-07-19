const { deleteFileFromS3 } = require("../config/s3");
const bannerModel = require("../models/banner.model")
const { uploadFile } = require("../utils/file")
const { validationResponse } = require("../utils/validationResponse")
const { BannerSchema } = require("../validators/banner.validate")
const path = require('path');

exports.list = async (req, res) => {
    try {
        const banner = await bannerModel.list(req.body)
        const total_count = await bannerModel.find({}).countDocuments()
        let transformedData = []
        if(banner.length > 0){
            transformedData = banner.map(data => data.transform(data,req.body?.lang))
        }
        
        return res.send({
            status: 0,
            data: transformedData,
            total_count
        })
        
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}

exports.create = async (req, res) => {
    try {
        const { error, value } = BannerSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {

            if(req.body.web_image){
                let result = await uploadFile(req.body.web_image)

                if(result.status == 1){
                    return res.send(result)
                }

                value.web_image = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key
            }

            if(req.body.mobile_image){
                let result = await uploadFile(req.body.mobile_image)

                if(result.status == 1){
                    return res.send(result)
                }

                value.mobile_image = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key
            }

            const banner = new bannerModel(value)

            await banner.save()

            return res.send({
                status: 0,
                message: 'Banner Created Successfully !'
            })
        }
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}

exports.detail = async (req, res) => {
    try {
        const banner = await bannerModel.findOne({banner_id: req.body.id})
        
        if(banner){

            return res.send({
                status: 0,
                data: banner.transform(banner)
            })
        }
        else{
            return res.send({
                status: 1,
                message: 'Banner Not Found !'
            })
        }
        
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}

exports.update = async (req, res) => {
    try {
        const { error, value } = BannerSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {
            const banner = await bannerModel.findOne({banner_id: value.id})

            if(banner){

                if(req.body.web_image){
                    if(!req.body.web_image.startsWith('http')){
                        let result = await uploadFile(req.body.web_image)
    
                        if(result.status == 1){
                            return res.send(result)
                        }
        
                        value.web_image = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key

                        if(banner.web_image){
                            const key = path.basename(banner.web_image)
                            await deleteFileFromS3(key)
                        }
                    }
                    else{
                        value.web_image = req.body.web_image
                    }
                }
    
                if(req.body.mobile_image){

                    if(!req.body.mobile_image.startsWith('http')){
                        let result = await uploadFile(req.body.mobile_image)
    
                        if(result.status == 1){
                            return res.send(result)
                        }
        
                        value.mobile_image = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key
                        
                        if(banner.mobile_image){
                            const key = path.basename(banner.mobile_image)
                            await deleteFileFromS3(key)
                        }
                    }
                    else{
                        value.mobile_image = req.body.mobile_image
                    }
                }

                await bannerModel.findOneAndUpdate({banner_id: req.body.id},value,{returnOriginal: false})
                
                return res.send({
                    status: 0,
                    message: 'Banner Updated Successfully !'
                })
            }
            else{
                return res.send({
                    status: 1,
                    message: 'Banner Not Found !'
                })
            }
        }
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}

exports.delete = async (req, res) => {
    try {
        const banner = await bannerModel.findOne({banner_id: req.body.id})
        
        if(banner){

            if(banner.web_image){
                const key = path.basename(banner.web_image)
                await deleteFileFromS3(key)
            }

            if(banner.mobile_image){
                const key = path.basename(banner.mobile_image)
                await deleteFileFromS3(key)
            }

            await bannerModel.findOneAndDelete({banner_id: req.body.id})
            
            return res.send({
                status: 0,
                message: 'Banner Deleted Successfully !'
            })
        }
        else{
            return res.send({
                status: 1,
                message: 'Banner Not Found !'
            })
        }
        
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}