const notificationModel = require("../models/notification.model")
const notiProvider = require('../services/notification/notiProvider');

exports.addRegisterToken = async (req, res, next) => {
    try {

        const {owner_id, user_id, employee_id, type, token} = req.body

        if (!owner_id && !employee_id && !user_id) {
            return res.send({
                status: 1,
                message:"At least one of owner_id, employee_id, or user_id is required!",
            });
        }

        const validTypes = ["owner", "employee", "user"];

        if (!validTypes.includes(type)) {
            return res.send({
            status: 1,
            message:
                "Invalid type. It should be 'owner', 'employee', or 'user'.",
            });
        }

        let notiCount = 0

        if(type == 'user'){
            notiCount = await notificationModel.find({ user_id: user_id }).countDocuments()
        }
        else if (type == 'owner'){
            notiCount = await notificationModel.find({ owner_id: owner_id }).countDocuments()
        }
        else{
            notiCount = await notificationModel.find({ employee_id: employee_id }).countDocuments()
        }

        if (notiCount > 0) {
            await notificationModel.findOneAndUpdate({ user_id: user_id }, req.body, { returnOriginal: false })
        }
        else {
            const noti = new notificationModel(req.body)

            await noti.save()
        }

        return res.json({
            status: 0,
            message: "Token Saved Successfully !"
        })

    } catch (error) {
        return res.json({
            status: 1,
            message: error.message
        })
    }
}

exports.sendNotificationToUser = async (req, res) => {
    try {
        const {title, message, type, user_id, owner_id, employee_id} = req.body

        if (!owner_id && !employee_id && !user_id) {
            return res.send({
                status: 1,
                message:"At least one of owner_id, employee_id, or user_id is required!",
            });
        }

        const validTypes = ["owner", "employee", "user"];

        if (!validTypes.includes(type)) {
            return res.send({
            status: 1,
            message:
                "Invalid type. It should be 'owner', 'employee', or 'user'.",
            });
        }

        let notiUser 

        if(type == 'user'){
            notiUser = await notificationModel.findOne({ user_id: user_id })
        }
        else if (type == 'owner'){
            notiUser = await notificationModel.findOne({ owner_id: owner_id })
        }
        else{
            notiUser = await notificationModel.findOne({ employee_id: employee_id })
        }
        
        if(!notiUser){
            return res.send({
                status: 1,
                message: "Please register notification token first !"
            })
        }

        await notiProvider.sendToDevice(notiUser.token, title, message);

        return res.send({
            status: 0,
            message: "Notification was sent successfully !"
        })

    } catch (error) {
        return res.send({
            status: 1,
            message: error.message
        })
    }
}

exports.sendNotificationToAllUsers = async (req, res) => {
    try {
        const {title, message} = req.body

        await notiProvider.sendToTopic("Sport Empire", title, message);

        return res.send({
            status: 0,
            message: "Notification was sent successfully !"
        })

    } catch (error) {
        return res.send({
            status: 1,
            message: error.message
        })
    }
}