const adminModel = require("../models/admin.model")
const gravatar = require('gravatar')
const bcrypt = require("bcryptjs")

exports.seedAdmin = async (req, res) => {

    try {

        let value = {
            name: "Admin",
            email: "admin@gmail.com",
            password: "123456",
            role: 0,
            phone: "0911221122"
        }

        const oldAdmin = await adminModel.findOne({ email: value.email });
    
        if (oldAdmin) {

            return res.send({
                status: 1,
                message: "Admin Already Exist. Please Login"
            });
        }
    
        const encryptedPassword = await bcrypt.hash(value.password, 10);

        let avatar = gravatar.url(value.name, {s: '100', r: 'x', d: 'retro'}, true)

        value.avatar = avatar
        value.password = encryptedPassword

        const admin = new adminModel(value)

        await admin.save()

        return res.send({
            status: 0,
            message: 'Admin Created Successfully !',
            admin: {
                id: admin.admin_id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                avatar: admin.avatar,
            }
        })
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        });
    }
}