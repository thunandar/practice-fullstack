const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const { courtPopulate } = require('../config/populate');

const schema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
        unique: true
    },
    sport_type_id: {
        type: Number,
        required: true
    },
    is_24_hr: {
        type: Boolean,
        default: true
    },
    open_hour: {
        type: String,
    },
    close_hour: {
        type: String,
    },
    off_time: [
        {
            type: String,
            required: false
        }
    ],
    off_day: [
        {
            type: String,
            required: false
        }
    ],
    size: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    facilities: {
        type: String,
        required: false
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    special_day_prices: [
        {
            day: String,
            am_fee: Number,
            pm_fee: Number,
        }
    ],
    price: [
        {
            hour: Number,
            am_fee: Number,
            pm_fee: Number,
        }
    ],
    region_id: {
        type: Number,
        required: true
    },
    township_id: {
        type: Number,
        required: true
    },
    ward: {
        type: String,
        required: false
    },
    street_1: {
        type: String,
        required: true
    },
    street_2: {
        type: String,
        required: false
    },
    address_no: {
        type: String,
        required: false
    },
    map_url: {
        type: String,
        required: false
    },
    near_by: {
        type: String,
        required: false
    },
    owner_id: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    is_multiple_count_per_hour: {
        type: Boolean,
        default: false
    },
    max_booking_count: {
        type: Number,
        default: 1
    },
    booking_limit: {
        type: Number,
        default: 1
    },
    active: {
        type: Boolean,
        default: true
    },
    court_id: Number,
},{
    timestamps: true,
})

schema.virtual('region', {
    ref: 'Region',
    localField: 'region_id',
    foreignField: 'region_id',
    justOne: true
});

schema.virtual('township', {
    ref: 'Township',
    localField: 'township_id',
    foreignField: 'township_id',
    justOne: true
});

schema.virtual('owner', {
    ref: 'Owner',
    localField: 'owner_id',
    foreignField: 'owner_id',
    justOne: true
});

schema.virtual('sport_type', {
    ref: 'SportType',
    localField: 'sport_type_id',
    foreignField: 'sport_type_id',
    justOne: true
});

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Court', schema)
          .findOne({}, {}, { sort: { court_id: -1 } }).exec();
  
        doc.court_id = lastDoc ? lastDoc.court_id + 1 : 1;
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
        'name',
        'sport_type',
        'is_24_hr',
        'open_hour',
        'close_hour',
        'off_time',
        'off_day',
        'size',
        'description',
        'facilities',
        'images',
        'price',
        'special_day_prices',
        'region',
        'township',
        'ward',
        'street_1',
        'active',
        'street_2',
        'address_no',
        'map_url',
        'near_by',
        'booking_limit',
        'owner',
        'max_booking_count',
        'phone'
    ]
    let transformed = {}

    fields.forEach((field) => {
        transformed[field] = this[field];
    });
    transformed["id"] = this['court_id']
    transformed["data_id"] = 'SEC-'+this['court_id']
    
    return transformed
  },
})

schema.statics = ({

  list({page = 1, per_page = 10, owner_id = ''}){

    if(owner_id != ''){
        return this.find({owner_id})
          .populate(courtPopulate)
          .sort({createdAt: -1 })
          .exec();  
    }
    
    return this.find({})
      .populate(courtPopulate)
      .sort({createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },
})


schema.plugin(uniqueValidator);

module.exports = mongoose.model('Court', schema);



