const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
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
    price: {
      monthly : Number,
      quarterly : Number,
      halfYearly : Number,
      yearly : Number,
    },
    order: {
        type: Number,
        default: 1
    },
    pricing_id: Number,
},{
    timestamps: true,
})

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Pricing', schema)
          .findOne({}, {}, { sort: { pricing_id: -1 } }).exec();
  
        doc.pricing_id = lastDoc ? lastDoc.pricing_id + 1 : 1;
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
            'court_limit',
            'push_notification_limit',
            'marketing_post_limit',
            'price',
            'order',
            'createdAt'
        ]
        let transformed = {}

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        transformed["id"] = this['pricing_id']
        transformed["data_id"] = 'SEP-'+this['pricing_id']

        return transformed
    }
})

schema.statics = ({

    list({page = 1, per_page = 10}){
  
      let select = "pricing_id name court_limit push_notification_limit marketing_post_limit price order createdAt"
  
      if(per_page == 'all'){
        return this.find({})
          .select(select)
          .sort({order: 1 })
          .exec();  
      }
      
      return this.find({})
        .select(select)
        .sort({order: 1 })
        .skip(per_page * (page - 1))
        .limit(per_page)
        .exec();
    },
  
  })

schema.plugin(uniqueValidator);

module.exports = mongoose.model('Pricing', schema);



