const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
    date : {
        type: String,
        required : true,
    },
    times: [
      {
          type: String,
          required: true
      }
    ],
  court_id: {
    type: Number
  },
    off_time_id: Number,
},{
    timestamps: true,
})

schema.virtual('court', {
  ref: 'Court',
  localField: 'court_id',
  foreignField: 'court_id',
  justOne: true
});

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('OffTime', schema)
          .findOne({}, {}, { sort: { off_time_id: -1 } }).exec();
  
        doc.off_time_id = lastDoc ? lastDoc.off_time_id + 1 : 1;
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
        'court',
        'date',
        'time',
        'createdAt'
    ]
    let transformed = {}

    fields.forEach((field) => {
        transformed[field] = this[field];
    });

    transformed["id"] = this['off_time_id']

    return transformed
  }

})

schema.plugin(uniqueValidator);

module.exports = mongoose.model('OffTime', schema);



