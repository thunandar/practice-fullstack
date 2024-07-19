const { employeePopulate } = require("../config/populate")
const { deleteFileFromS3 } = require("../config/s3")
const employeeModel = require("../models/employee.model")
const ownerModel = require("../models/owner.model")
const { uploadFile } = require("../utils/file")
const { validationResponse } = require("../utils/validationResponse")
const { EmployeeSchema } = require("../validators/employee.validate")
const bcrypt = require("bcryptjs")
const gravatar = require('gravatar')
const path = require('path');
const bookingModel = require("../models/booking.model");
const { changeDateTimeFormat } = require("../utils/date-time");

const calculateBalances = (employees) => {
    let appBalance = 0;
    let transactionBalance = 0;
    let appCount = 0;
  
    employees?.forEach((data) => {
      appBalance += data.total_amount;
  
      if (!data.is_manual) {
        transactionBalance += data.total_amount;
        appCount++;
      }
    });
  
    const manualBalance = appBalance - transactionBalance;
    const chargesForTransaction = 0.05 * transactionBalance; // 5% of transaction
  
    return { appBalance, transactionBalance, manualBalance, chargesForTransaction, appCount };
};
  
exports.dashboard = async (req, res) => {
    try {
        const { id, from, to  } = req.body;

        const employee = await employeeModel.findOne({ employee_id: id });

        if (!employee) {
        return res.send({
            status: 1,
            message: "Employee Not Found !",
        });
        }

        const dateFilter = employeeDateFilter(id, from, to); 
    
        const bookings = await bookingModel.find(dateFilter).exec();
    
        const { appBalance, transactionBalance, manualBalance, chargesForTransaction, appCount } = calculateBalances(bookings);
    
        const total_count = await bookingModel.find(dateFilter).countDocuments();
        const manualCount = total_count - appCount;
    
        return res.send({
            status: 0,
            app_balance: appBalance,
            transaction_balance: transactionBalance,
            manual_balance: manualBalance,
            charges_for_transaction: chargesForTransaction,
            total_count: total_count,
            app_count: appCount,
            manual_count: manualCount,
        });        
    } catch (error) {
      return res.send({
        status: 1,
        message: error?.message,
      });
    }
};

function employeeDateFilter(id, from, to) {
    let filter = {};
  
    if (id) {
        filter = {
        ...filter,
        employee_id: id,
        };
    }
  
    const { startDate, endDate } = changeDateTimeFormat(from, to);
  
    if (startDate !== null && endDate !== null) {
      filter = {
        ...filter,
        booking_date: { $gte: startDate, $lte: endDate },
      };
    }
    return filter;
  }

  
exports.list = async (req, res) => {
    try {
        if(!req.body.access_token){
            return res.send({
                status: 1,
                message: 'Owner Access Token is required'
            })
        }

        const owner = await ownerModel.findOne({access_token: req.body.access_token})
        req.body.owner = owner._id
        const employees = await employeeModel.list(req.body)
        let total_count = await employeeModel.find({}).countDocuments()

        if(req.body.owner){
            total_count = await employeeModel.find({owner: req.body.owner}).countDocuments()
        }

        let transformedData = []
        if(employees.length > 0){
            transformedData = employees.map(data => data.transform(data,req.body?.lang))
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
        const { error, value } = EmployeeSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {
            if(value.is_access_court){

                if(!value.email || !value.password || !value.court_ids || value.court_ids == []){
                    return res.send({
                        status : 1,
                        message: "Email , Password and courts is required"
                    }); 
                }

                const oldEmployee = await employeeModel.findOne({email: value.email})

                if(oldEmployee){
                    return res.send({
                        status : 1,
                        message: "Email Already Used , Please Login !"
                    }); 
                }

                value.password = await bcrypt.hash(value.password, 10);
            
                value.courts = value.court_ids
            }
            
            let avatar = gravatar.url(value.name, {s: '100', r: 'x', d: 'retro'}, true)

            if(req.body.avatar){
                let result = await uploadFile(req.body.avatar)

                if(result.status == 1){
                    return res.send(result)
                }

                avatar = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key
            }

            value.avatar = avatar

            value.access_token = ''

            const employee = new employeeModel(value)

            await employee.save()

            return res.send({
                status: 0,
                message: 'Employee Created Successfully !'
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
        const employee = await employeeModel.findOne({employee_id: req.body.id}).populate(employeePopulate)
        
        if(employee){

            return res.send({
                status: 0,
                data: employee.transform(employee)
            })
        }
        else{
            return res.send({
                status: 1,
                message: 'Employee Not Found !'
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
        const { error, value } = EmployeeSchema.validate(req.body, {
            abortEarly: false,
        });
        
        if (error) {
            const errors = validationResponse(error)
            return res.send({
                status : 1,
                errors
            });
        } else {

            const employee = await employeeModel.findOne({employee_id: value.id})

            if(!employee){
                return res.send({
                    status : 1,
                    message: "Employee Not Found !"
                });
            }

            if(value.is_access_court){
                if(!value.email || !value.court_ids || value.court_ids == []){
                    return res.send({
                        status : 1,
                        message: "Email , Password and courts is required"
                    }); 
                }

                value.courts = value.court_ids
            }
                        
            let avatar = gravatar.url(value.name, {s: '100', r: 'x', d: 'retro'}, true)

            if(req.body.avatar){
                if(!req.body.avatar.startsWith('http')){
                    let result = await uploadFile(req.body.avatar)

                    if(result.status == 1){
                        return res.send(result)
                    }
    
                    avatar = req.protocol + '://' + req.get('host') + '/images/'+result.data.Key

                    if(employee.avatar){
                        const key = path.basename(employee.avatar)
                        await deleteFileFromS3(key)
                    }
                }
                else{
                    avatar = req.body.avatar
                }
            }

            value.avatar = avatar


            value.access_token = employee.access_token
            value.password = employee.password

            await employeeModel.findOneAndUpdate({employee_id: value.id},value,{returnOriginal: false})

            return res.send({
                status: 0,
                message: 'Employee Updated Successfully !'
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
        const employee = await employeeModel.findOne({employee_id: req.body.id})

        if(!employee){
            return res.send({
                status: 1,
                message: 'Employee Not Found !',
                is_login: true
            })
        }

        if(employee.avatar){
            const key = path.basename(employee.avatar)
            await deleteFileFromS3(key)
        }

        await employeeModel.findOneAndDelete({employee_id: req.body.id})
        
        return res.send({
            status: 0,
            message: 'Employee Deleted Successfully !'
        })
        
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}