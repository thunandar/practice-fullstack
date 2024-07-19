const { deleteFileFromS3 } = require("../config/s3");
const regionModel = require("../models/region.model")
const { uploadFile } = require("../utils/file")
const { validationResponse } = require("../utils/validationResponse")
const { RegionSchema } = require("../validators/region.validate")
const path = require('path');

exports.list = async (req, res) => {
    try {
        const region = await regionModel.list(req.body)
        const total_count = await regionModel.find({}).countDocuments()
        let transformedData = []
        if(region.length > 0){
            transformedData = region.map(data => data.transform(data))
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
        const { error, value } = RegionSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {
            if(req.body.logo){
                let result = await uploadFile(req.body.logo)

                if(result.status == 1){
                    return res.send(result)
                }

                value.logo = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key
            }

            const region = new regionModel(value)

            await region.save()

            return res.send({
                status: 0,
                message: 'Region Created Successfully !'
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
        const region = await regionModel.findOne({region_id: req.body.id})
        
        if(region){
            return res.send({
                status: 0,
                data: region.transform(region,req.body?.lang)
            })
        }
        else{
            return res.send({
                status: 1,
                message: 'Region Not Found !'
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
        const { error, value } = RegionSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {
            const region = await regionModel.findOne({region_id: value.id})

            if(region){

                if(req.body.logo){
                    if(!req.body.logo.startsWith('http')){
                        let result = await uploadFile(req.body.logo)
    
                        if(result.status == 1){
                            return res.send(result)
                        }
        
                        value.logo = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key

                        if(region.logo){
                            const key = path.basename(region.logo)
                            await deleteFileFromS3(key)
                        }
                    }
                    else{
                        value.logo = req.body.logo
                    }
                }

                await regionModel.findOneAndUpdate({region_id: req.body.id},value,{returnOriginal: false})
                
                return res.send({
                    status: 0,
                    message: 'Region Updated Successfully !'
                })
            }
            else{
                return res.send({
                    status: 1,
                    message: 'Region Not Found !'
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
        const region = await regionModel.findOne({region_id: req.body.id})
        
        if(region){

            if(region.logo){
                const key = path.basename(region.logo)
                await deleteFileFromS3(key)
            }

            await regionModel.findOneAndDelete({region_id: req.body.id})
            
            return res.send({
                status: 0,
                message: 'Region Deleted Successfully !'
            })
        }
        else{
            return res.send({
                status: 1,
                message: 'Region Not Found !'
            })
        }
        
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}