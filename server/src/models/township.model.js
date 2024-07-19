const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const { townshipPopulate } = require('../config/populate');

const schema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
    },
    region_id: {
      type: Number,
      required: true
    },
    township_id: Number,
},{
    timestamps: true,
})

schema.virtual('region', {
  ref: 'Region',
  localField: 'region_id',
  foreignField: 'region_id',
  justOne: true
});

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Township', schema)
          .findOne({}, {}, { sort: { township_id: -1 } }).exec();
  
        doc.township_id = lastDoc ? lastDoc.township_id + 1 : 1;
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
        'region',
        'createdAt'
    ]
    let transformed = {}

    fields.forEach((field) => {
        transformed[field] = this[field];
    });

    transformed["id"] = this['township_id']
    return transformed
  },
})

schema.statics = ({

  list({page = 1, per_page = 10, region_id = 'all'}){

    if(per_page == 'all'){
      return this.find({})
        .populate(townshipPopulate)
        .sort({createdAt: -1 })
        .exec();  
    }

    if(region_id != 'all'){
      return this.find({region_id: region_id})
        .populate(townshipPopulate)
        .sort({createdAt: -1 })
        .skip(per_page * (page - 1))
        .limit(per_page)
        .exec();
    }
    
    return this.find({})
      .populate(townshipPopulate)
      .sort({createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },

})


schema.plugin(uniqueValidator);

module.exports = mongoose.model('Township', schema);



