const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const { bookingStatus } = require('../config/vars');
const { primaryDateFormat } = require('../utils/date-time');
const { bookingPopulate } = require('../config/populate');

const schema = new mongoose.Schema({
    court_id: {
        type: Number,
        required: true
    },
    owner_id: {
        type: Number,
        required: true
    },
    employee_id: {
        type: Number,
        required: false
    },
    user_id: {
        type: Number,
        required: true
    },
    booking_time: [
        {
            type: String,
            required: true
        }
    ],
    booking_date: {
        type: Date,
        required: true
    },
    status: {
        type: Number,
        default: bookingStatus.booked
    },
    is_manual: {
        type: Boolean,
        required: true
    },
    discount_amount: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        required: true
    },
    booking_id: Number,
},{
    timestamps: true,
})

schema.virtual('owner', {
    ref: 'Owner',
    localField: 'owner_id',
    foreignField: 'owner_id',
    justOne: true
});

schema.virtual('court', {
    ref: 'Court',
    localField: 'court_id',
    foreignField: 'court_id',
    justOne: true
});

schema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: 'user_id',
    justOne: true
});

schema.virtual('employee', {
    ref: 'Employee',
    localField: 'employee_id',
    foreignField: 'employee_id',
    justOne: true
});

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Booking', schema)
          .findOne({}, {}, { sort: { booking_id: -1 } }).exec();
  
        doc.booking_id = lastDoc ? lastDoc.booking_id + 1 : 1;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
});

schema.methods = ({
  transform (data = this) {
    let fields = [
        'court',
        'booking_time',
        'owner',
        'booking_date',
        'user',
        'status',
        'is_manual',
        'createdAt',
        'employee',
        'discount_amount',
        'total_amount',
    ]
    let transformed = {}

    fields.forEach((field) => {
        transformed[field] = this[field];
    });

    transformed["id"] = this['booking_id']
    transformed["booking_date"] = primaryDateFormat(this['booking_date'])
    transformed["data_id"] = 'SEB-'+this['booking_id']

    return transformed
  },
})

schema.statics = ({
    list({page = 1, per_page = 10, status = 'all', owner_id = 'all', courts = []}){
        
        let filter = {}
        
        if(status != 'all'){
            filter = {...filter,status}
        }

        if(owner_id != 'all'){
            filter = {...filter,owner_id}
        }

        if(courts.length != 0){
            filter = {...filter,court: { "$in" : courts}}
        }
        
        return this.find(filter)
            .populate(bookingPopulate)
          .sort({createdAt: -1 })
          .skip(per_page * (page - 1))
          .limit(per_page)
          .exec();
    },

    bookByCourtAndDate(date,court_id){
        return this.find({booking_date: date,court_id})
          .sort({createdAt: -1 })
          .exec();
    }
})


schema.plugin(uniqueValidator);

module.exports = mongoose.model('Booking', schema);



