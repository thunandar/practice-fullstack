const sportTypeModel = require("../models/sportTypes.model")
const { validationResponse } = require("../utils/validationResponse")
const { sportTypesSchema } = require("../validators/sportTypes.validate")


exports.list = async (req, res) => {
    try {
        const sportTypes = await sportTypeModel.list(req.body)
        const total_count = await sportTypeModel.find({}).countDocuments()
        let transformedData = []
        if(sportTypes.length > 0){
            transformedData = sportTypes.map(type => type.transform())
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
        const { error, value } = sportTypesSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {
            const sportType = new sportTypeModel(value)

            await sportType.save()

            return res.send({
                status: 0,
                message: 'Sport Types Created Successfully !'
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
        const sportType = await sportTypeModel.findOne({sport_type_id: req.body.id})
        
        if(sportType){

            return res.send({
                status: 0,
                data: sportType.transform()
            })
        }
        else{
            return res.send({
                status: 1,
                message: 'Sport Type Not Found !'
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
        const { error, value } = sportTypesSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {
            await sportTypeModel.findOneAndUpdate({sport_type_id: req.body.id},value,{returnOriginal: false})
                
            return res.send({
                status: 0,
                message: 'Sport Types Updated Successfully !'
            })
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
        const sportType = await sportTypeModel.findOneAndDelete({sport_type_id: req.body.id});

        if (sportType) {
            return res.send({
                status: 0,
                message: 'Sport Type Deleted Successfully !'
            })
        }
        return res.send({
            status: 1,
            message: "Sport Type Not Found !",
          });     
        
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}