const { role } = require("../config/vars");
const adminModel = require("../models/admin.model");
const ownerModel = require("../models/owner.model");

exports.ownerRoleVerify = async (req, res, next) => {
    try {

        const access_token = req.body.access_token || req.query.access_token || req.headers["x-access-token"];

        if (!access_token) {
            return res.send({
                status: 1,
                message: "access_token is required"
            });
        }

        const owner = await ownerModel.findOne({access_token})

        if(owner){
            return next()
        }   
        else{
            const admin = await adminModel.findOne({access_token})

            if(admin){
                if(admin.role == role.admin){
                    return next()
                }
                else{
                    return res.send({
                        status: 1,
                        message: "You don't have permission !",
                    });
                }
            }   
            else{
                return res.send({
                    status: 1,
                    message: "You don't have permission!"
                });
            }
        }
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        });
    }
}