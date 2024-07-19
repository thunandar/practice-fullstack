const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
    },
    logo: {
        type: String,
        required: false
    },
    region_id: Number,
},{
    timestamps: true,
})

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Region', schema)
          .findOne({}, {}, { sort: { region_id: -1 } }).exec();
  
        doc.region_id = lastDoc ? lastDoc.region_id + 1 : 1;
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
        'logo',
        'createdAt'
    ]
    let transformed = {}

    fields.forEach((field) => {
        transformed[field] = this[field];
    });

    if(this['logo'] == null){
      transformed['logo'] = null
    } 

    transformed["id"] = this['region_id']
    return transformed
  },
})

schema.statics = ({

  list({page = 1, per_page = 10}){

    let select = "name region_id logo createdAt"

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

module.exports = mongoose.model('Region', schema);



