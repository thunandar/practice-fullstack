const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
    title : {
        type: String,
        required : false,
    },
    body : {
      type: String,
      required : false,
    },
    url: {
        type: String,
        required: false
    },
    mobile_image: {
      type: String,
      required: true
    },
    web_image: {
      type: String,
      required: true
    },
    banner_id: Number,
},{
    timestamps: true,
})

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Banner', schema)
          .findOne({}, {}, { sort: { banner_id: -1 } }).exec();
  
        doc.banner_id = lastDoc ? lastDoc.banner_id + 1 : 1;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
});

schema.methods = ({
  transform (data = this,lang = 'en') {
    let fields = [
        'title',
        'body',
        'url',
        'mobile_image',
        'web_image',
        'createdAt'
    ]
    let transformed = {}

    fields.forEach((field) => {
        transformed[field] = this[field];
    });

    transformed["id"] = this['banner_id']
    return transformed
  },
})

schema.statics = ({

  list({page = 1, per_page = 10}){

    let select = "banner_id title body url mobile_image web_image createdAt"

    if(per_page == 'all'){
      return this.find({})
        .select(select)
        .sort({createdAt: -1 })
        .exec();  
    }
    
    return this.find({})
      .select(select)
      .sort({createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },

})


schema.plugin(uniqueValidator);

module.exports = mongoose.model('Banner', schema);



