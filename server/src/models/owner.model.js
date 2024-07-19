const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const { ownerStatus, file } = require('../config/vars');
const { ownerPopulate } = require('../config/populate');

const schema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
        // minLength: 3,
        // maxLength : 20
    },
    phone : {
        type: String,
        required : true,
        // minLength: 5,
        // maxLength: 13
    },
    email : {
        type : String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    address : {
        type: String,
    },
    business_name : {
        type: String,
        required : true,
    },
    business_email : {
        type : String,
        required: false,
        trim: true,
        lowercase: true,
    },
    business_phone : {
        type: String,
        required : false,
    },
    nrc_no : {
        type: String,
        required : true,
    },
    tags: [Number],
    password:  {
        type:String,    
        required: false,
    },
    avatar: {
        type: String,
        required: false
    },
    business_logo: {
        type: String,
        default: file.default_image
    },
    nrc_front: {
        type: String,
        required: false
    },
    nrc_back: {
        type: String,
        required: false
    },
    lang: {
        type: String,
        default: 'en'
    },
    is_email_verified: {
        type: Boolean,
        default: false
    },
    verify_code: {
        type: String,
        required: false
    },
    status: {
        type: Number,
        default: ownerStatus.pending
    },
    court_limit: {
        type: Number,
        default: 1
    },
    push_notification_limit: {
        type: Number,
        default: 0
    },
    marketing_post_limit: {
        type: Number,
        default: 0
    },
    kpay_name: {
        type: String,
        required: false
    },
    kpay_no: {
        type: String,
        required: false
    },
    kbz_banking_no: {
        type: String,
        required: false
    },
    wavepay_name: {
        type: String,
        required: false
    },
    wavepay_no: {
        type: String,
        required: false
    },
    cb_banking_no: {
        type: String,
        required: false
    },
    uab_pay_no: {
        type: String,
        required: false
    },
    uab_banking_no: {
        type: String,
        required: false
    },
    aya_pay_no: {
        type: String,
        required: false
    },
    aya_banking_no: {
        type: String,
        required: false
    },
    owner_id: Number,
    access_token: String,
},{
    timestamps: true,
})

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

schema.virtual('sport_type_data', {
    ref: 'SportType',
    localField: 'tags',
    foreignField: 'sport_type_id',
    justOne: false
});

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Owner', schema)
          .findOne({}, {}, { sort: { owner_id: -1 } }).exec();
  
        doc.owner_id = lastDoc ? lastDoc.owner_id + 1 : 1;
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
            'business_name',
            'business_email',
            'business_phone',
            'business_logo',
            'nrc_no',
            'nrc_front',
            'nrc_back',
            'status',
            'court_limit',
            'push_notification_limit',
            'marketing_post_limit',
            'kpay_name',
            'kpay_no',
            'kbz_banking_no',
            'wavepay_name',
            'wavepay_no',
            'cb_banking_no',
            'uab_pay_no',
            'uab_banking_no',
            'aya_pay_no',
            'aya_banking_no',
            'tags',
            'lang',
            'createdAt',
        ]

        let transformed = {}

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        transformed["tags"] = this['sport_type_data']
        
        transformed["id"] = this['owner_id']
        transformed["data_id"] = 'SEO-'+this['owner_id']

        return transformed
    },
})

schema.statics = ({
    list({page = 1, per_page = 10, status = 'all'}){
        
        let filter = {}
        
        if(status != 'all'){
            filter = {status}
        }
        
        return this.find(filter)
          .populate(ownerPopulate)
          .sort({createdAt: -1 })
          .skip(per_page * (page - 1))
          .limit(per_page)
          .exec();
    },

})

schema.plugin(uniqueValidator);

module.exports  = mongoose.model('Owner', schema);


