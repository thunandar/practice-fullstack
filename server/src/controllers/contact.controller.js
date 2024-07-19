const { validationResponse } = require("../utils/validationResponse");
const { ContactSchema } = require("../validators/contact.validate");
const contactModel = require("../models/contact.model");

exports.send = async (req, res) => {
  try {
    const { error, value } = ContactSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = validationResponse(error);
      return res.send({
        status: 1,
        errors,
      });
    } else {
      const owner_id = value.owner_id;
      const employee_id = value.employee_id;
      const user_id = value.user_id;
      const contactType = value.type;

      if (!owner_id && !employee_id && !user_id) {
        return res.send({
          status: 1,
          message:
            "At least one of owner_id, employee_id, or user_id is required!",
        });
      }

      const validTypes = ["owner", "employee", "user"];
      if (!validTypes.includes(contactType)) {
        return res.send({
          status: 1,
          message:
            "Invalid contact type. It should be 'owner', 'employee', or 'user'.",
        });
      }

      const contact = new contactModel(value);

      await contact.save();

      return res.send({
        status: 0,
        message: "Contact Created Successfully !",
      });
    }
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.list = async (req, res) => {
  try {
    const contact = await contactModel.list(req.body);
    const total_count = await contactModel.find({}).countDocuments();
    let transformedData = [];
    if (contact.length > 0) {
      transformedData = contact.map((data) => data.transform(data));
    }

    return res.send({
      status: 0,
      data: transformedData,
      total_count,
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {

    const contact = await contactModel.findOneAndDelete({ contact_id: req.body.id });
    
    if (!contact) {
      return res.send({
        status: 1,
        message: "Contact Not Found !",
      });
    } 
    
    return res.send({
      status: 0,
      message: "Contact Deleted Successfully !",
    });
  } catch (error) {
    return res.send({
      status: 1,
      message: error?.message,
    });
  }
};
