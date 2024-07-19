const { role } = require("../config/vars")
const adminModel = require("../models/admin.model");
const employeeModel = require("../models/employee.model");

exports.adminRoleVerify = async (req, res, next) => {
    try {

        const access_token = req.body.access_token || req.query.access_token || req.headers["x-access-token"];

        if (!access_token) {
            return res.send({
                status: 1,
                message: "access_token is required"
            });
        }

        const admin = await adminModel.findOne({access_token})

        if(admin){
            if(admin.role == role.admin){
                return next()
            }
            else{
                return res.send({
                    status: 1,
                    message: "You don't have permission !"
                });
            }
        }   
        else{
            return res.send({
                status: 1,
                message: "You don't have permission!"
            });
        }
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        });
    }
}

exports.moderatorRoleVerify = async (req, res, next) => {
    try {

        const access_token = req.body.access_token || req.query.access_token || req.headers["x-access-token"];

        if (!access_token) {
            return res.send({
                status: 1,
                message: "access_token is required"
            });
        }

        const admin = await adminModel.findOne({access_token})

        if(admin){
            if(admin.role == role.admin || admin.role == role.moderator){
                return next()
            }
            else{
                return res.send({
                    status: 1,
                    message: "You don't have permission !"
                });
            }
        }   
        else{
            return res.send({
                status: 1,
                message: "You don't have permission!"
            });
        }
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        });
    }
}

exports.employeeRoleVerify = async (req, res, next) => {
    try {

        const access_token = req.body.access_token || req.query.access_token || req.headers["x-access-token"];

        if (!access_token) {
            return res.send({
                status: 1,
                message: "access_token is required"
            });
        }

        const employee = await employeeModel.findOne({access_token})

        if(!employee){
            return res.send({
                status: 1,
                message: "You don't have permission !"
            });
        }   
        next()
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        });
    }
}