const courtModel = require("../models/court.model")
const employeeModel = require("../models/employee.model")
const ownerModel = require("../models/owner.model")
const bookingModel = require("../models/booking.model")
const { primaryDateFormat } = require("../utils/date-time")
const dayjs = require("dayjs")
const offTimeModel = require("../models/offTime.model")


exports.list = async (req, res) => {
    try {
        const {court_id,date = primaryDateFormat(new Date())} = req.body

        const court = await courtModel.findOne({court_id})

        if(!court){
            return res.send({
                status: 1,
                message: "Court not found"
            })
        }

        // let updater = await checkAccess(court,access_token)

        // if(updater.status == 1){
        //     return res.send(updater)
        // }

        let timelist = [
            "12:00 am",
            "1:00 am",
            "2:00 am",
            "3:00 am",
            "4:00 am",
            "5:00 am",
            "6:00 am",
            "7:00 am",
            "8:00 am",
            "9:00 am",
            "10:00 am",
            "11:00 am",
            "12:00 pm",
            "1:00 pm",
            "2:00 pm",
            "3:00 pm",
            "4:00 pm",
            "5:00 pm",
            "6:00 pm",
            "7:00 pm",
            "8:00 pm",
            "9:00 pm",
            "10:00 pm",
            "11:00 pm"
        ]
    
        if(!court.is_24_hr){
            let openIndex = timelist.indexOf(court.open_hour)
            let closeIndex = timelist.indexOf(court.close_hour) + 1
            timelist = timelist.slice(openIndex,closeIndex)
        }
    
        const getDate = dayjs(date).format('dddd')
    
        if(court.off_day.includes(getDate)){
            return res.send({
                status: 1,
                message: getDate + ' is off date'
            })
        }
    
        let data = []
        let books = await bookingModel.find({court_id: court.court_id,booking_date: date}).populate([
            {
                path: 'user',
                ref: 'User',
                select: 'user_id name email phone -_id'
            }
        ])
               
        let offTime = await offTimeModel.findOne({court_id:court.court_id,date:date})
        
        for(let i = 0; i < timelist.length; i++){
            let avaliable_time = true
            if(court.off_time.includes(timelist[i])){
                data.push({
                    time: timelist[i],
                    is_avaliable: false,
                    is_primary_off_time: true,
                    user: null
                })
                avaliable_time = false
            }
            if(books.length > 0){
                for(let t = 0; t < books.length; t++){
                    let b_times = books[t].booking_time
                    b_times.forEach(time => {
                        if(time == timelist[i]){
                            data.push({
                                time: timelist[i],
                                is_avaliable: false,
                                user: books[t].user,
                                is_off_time: false,
                            })
                            avaliable_time = false
                        }
                    })
                }
            }
            if(offTime){
                if(offTime.times.includes(timelist[i])){
                    data.push({
                        time: timelist[i],
                        is_avaliable: false,
                        is_off_time: true,
                        user: null
                    })
                    avaliable_time = false
                }
            }
            if(avaliable_time){
                data.push({
                    time: timelist[i],
                    is_avaliable: true,
                    user: null
                })
            }
        }

        return res.send({
            status: 0,
            data
        })

    } catch (error) {
        return res.send({
            status: 1,
            message: error.message
        })
    }
}

exports.updateOffTime = async (req, res) => {
    try {
        const {court_id , date , time, access_token, is_close } = req.body

        if(!court_id || !date || !time){
            return res.send({
                status: 1,
                message: "Court , date and time is required"
            })
        }

        const court = await courtModel.findOne({court_id})
        
        if(!court){
            return res.send({
                status: 1,
                message: "Court not found"
            })
        }

        // let updater = await checkAccess(court,access_token)

        // if(updater.status == 1){
        //     return res.send(updater)
        // }

        let offTime = await offTimeModel.findOne({court_id: court.court_id,date})

        let times = []

        if(offTime) {
            
            times = offTime.times

            if(is_close){
                times = [...times,time]
            }
            else{
                times = times.filter(t => t != time)

            }

            await offTimeModel.findOneAndUpdate({court_id: court.court_id,date: date},{times},{returnOriginal: false})
        }
        else{
            times = [...times,time]

            // console.log(times,time)

            offTime = new offTimeModel({
                court_id: court.court_id,
                date: date,
                times: times
            })

            await offTime.save()
        }

        return res.send({
            status: 0,
            message: "Updated Successfully !"
        })

    } catch (error) {
        return res.send({
            status: 1,
            message: error.message
        })
    }
}


async function checkAccess (court,access_token) {
    
    let updater 
        
    updater = await ownerModel.findOne({access_token})

    if(updater){
        if(updater._id.toString() != court.owner.toString()){
            return {
                status : 1,
                message: "You don't have access for this court"
            }
        }
    }
    else{
        updater = await employeeModel.findOne({access_token: access_token})
        if(!updater.courts.includes(court.court_id.toString())){
            return {
                status : 1,
                message: "you don't have access for this court"
            }
        }
    } 

    return {
        status: 0,
        updater
    }
}