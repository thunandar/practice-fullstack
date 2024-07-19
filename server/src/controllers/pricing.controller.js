const planOrderModel = require("../models/planOrder.model");
const pricingModel = require("../models/pricing.model");
const { validationResponse } = require("../utils/validationResponse")
const { PricingSchema } = require("../validators/pricing.validate")

exports.list = async (req, res) => {
    try {
        const pricing = await pricingModel.list(req.body)
        const total_count = await pricingModel.find({}).countDocuments()
        let transformedData = []
        if(pricing.length > 0){
            transformedData = pricing.map(data => data.transform(data))
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
        const { error, value } = PricingSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {

            const pricing = new pricingModel(value)

            await pricing.save()

            return res.send({
                status: 0,
                message: 'Pricing Created Successfully !'
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
        const pricing = await pricingModel.findOne({pricing_id: req.body.id})
        
        if(pricing){

            return res.send({
                status: 0,
                data: pricing.transform(pricing)
            })
        }
        else{
            return res.send({
                status: 1,
                message: 'Pricing Not Found !'
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
        const { error, value } = PricingSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {
            const pricing = await pricingModel.findOne({pricing_id: value.id})

            if(pricing){

                await pricingModel.findOneAndUpdate({pricing_id: req.body.id},value,{returnOriginal: false})
                
                return res.send({
                    status: 0,
                    message: 'Pricing Updated Successfully !'
                })
            }
            else{
                return res.send({
                    status: 1,
                    message: 'Pricing Not Found !'
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
        const pricing = await pricingModel.findOneAndDelete({pricing_id: req.body.id})

        if (pricing) {
            return res.send({
                status: 0,
                message: 'Pricing Deleted Successfully !'
            })
        }
        return res.send({
            status: 1,
            message: "Pricing Not Found !",
          });
                    
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}

exports.ownerPricingList = async (req, res) => {
    try {

        const {access_token, owner_id } = req.body

        
        const planOrder = await planOrderModel.ongoingPlan(owner_id)

        let plan_ids = []

        if(planOrder.length > 0){
            plan_ids = planOrder.map(obj => obj.pricing_id);
        }


        const pricing = await pricingModel.list(req.body)
        
        const total_count = await pricingModel.find({}).countDocuments()
        
        let transformedData = []
        
        if(pricing.length > 0){
            transformedData = pricing.map(data => data.transform(data))

            transformedData = transformedData.map(d => {
                if(plan_ids.includes(Number(d.id))){
                    return {
                        ...d,
                        is_buy: true
                    }
                }
                else{
                    return {
                        ...d,
                        is_buy: false
                    }
                }
            })
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

exports.createSubscription = async (req, res) => {
    try {
        const { error, value } = PricingSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {

            const pricing = new pricingModel(value)

            await pricing.save()

            return res.send({
                status: 0,
                message: 'Pricing Created Successfully !'
            })
        }
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}
