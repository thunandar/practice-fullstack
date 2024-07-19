const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
    name : {
        type: String,
        required : true,
    },
    icon: {
        type: String,
        required: true
    },
    sport_type_id: Number,
},{
    timestamps: true,
})

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('SportType', schema)
          .findOne({}, {}, { sort: { sport_type_id: -1 } }).exec();
  
        doc.sport_type_id = lastDoc ? lastDoc.sport_type_id + 1 : 1;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
});

schema.method({
  transform () {
    let fields = [
        'name',
        'icon',
        'createdAt'
    ]
    let transformed = {}

    fields.forEach((field) => {
        transformed[field] = this[field];
    });

    transformed["id"] = this['sport_type_id']

    return transformed
  }

})

schema.statics = ({
  
  list({page = 1, per_page = 10}){

    if(per_page == 'all'){
      return this.find({})
        .sort({createdAt: -1 })
        .exec();  
    }

    return this.find({})
      .sort({createdAt: -1 })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .exec();
  },

})


schema.plugin(uniqueValidator);

module.exports = mongoose.model('SportType', schema);



