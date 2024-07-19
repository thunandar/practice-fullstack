const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const { employeePopulate } = require('../config/populate');

const schema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
        minLength: 3,
        maxLength : 20
    },
    phone : {
        type: String,
        required : true,
        minLength: 5,
        maxLength: 13
    },
    address : {
        type: String,
    },
    nrc_no : {
        type: String,
        required : false,
    },
    avatar: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'Other'
    },
    owner_id: {
        type: Number
    },
    salary: {
        type: Number,
        required: false
    },
    is_access_court: {
        type: Boolean,
        default: false
    },
    courts: [Number],
    email : {
        type : String
    },
    verify_code : {
        type: String,
    },
    password:  {
        type:String 
    },
    employee_id: Number,
    access_token: String,
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
    localField: 'courts',
    foreignField: 'court_id',
    justOne: false
});

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Employee', schema)
          .findOne({}, {}, { sort: { employee_id: -1 } }).exec();
  
        doc.employee_id = lastDoc ? lastDoc.employee_id + 1 : 1;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
});

schema.method({
    transform() {
        let fields = [
            'name',
            'email',
            'phone',
            'avatar',
            'address',
            'nrc_no',
            'role',
            'createdAt',
            'is_access_court',
            'owner',
            'salary'
        ]

        let transformed = {}
        
        transformed['courts'] = this['court'];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        transformed["id"] = this['employee_id']
        transformed["data_id"] = 'SEE-'+this['employee_id']

        return transformed
    },
})

schema.statics = ({
    list({page = 1, per_page = 10, owner_id = ''}){
        let filter = {}
        
        if(owner_id != ''){
            filter = {owner_id}
        }
        
        return this.find(filter)
          .populate(employeePopulate)
          .sort({createdAt: -1 })
          .skip(per_page * (page - 1))
          .limit(per_page)
          .exec();
    },
})

schema.plugin(uniqueValidator);

module.exports  = mongoose.model('Employee', schema);


