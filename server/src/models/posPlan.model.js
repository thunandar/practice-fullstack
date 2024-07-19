const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const { planPopulate } = require('../config/populate');
const { planStatus } = require('../config/vars');

const schema = new mongoose.Schema({
    owner_id: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    expired_date: {
        type: Date,
        required: true
    },
    status: {
        type: Number,
        default: planStatus.pending
    },
    pos_plan_id: Number,
},{
    timestamps: true,
})

schema.virtual('owner', {
    ref: 'Owner',
    localField: 'owner_id',
    foreignField: 'owner_id',
    justOne: true
});

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('PosPlan', schema)
          .findOne({}, {}, { sort: { pos_plan_id: -1 } }).exec();
  
        doc.pos_plan_id = lastDoc ? lastDoc.pos_plan_id + 1 : 1;
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
            'owner',
            'start_date',
            'expired_date',
            'status',
            'createdAt'
        ]
        let transformed = {}

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        transformed["id"] = this['pos_plan_id']
        return transformed
    }
})

schema.statics = ({

    list({page = 1, per_page = 10, owner_id = ''}){
    
        let filter = {}
      
        if(status != 'all'){
            filter = {status: status}
        }

        if(owner_id != ''){
            filter = {...filter,owner_id: owner_id}
        }

      return this.find(filter)
        .populate(planPopulate)
        .sort({createdAt: -1 })
        .skip(per_page * (page - 1))
        .limit(per_page)
        .exec();
    },

    ongoingPlan(owner){
    
        const filter =
        {
            $where: function () {
                return this.start_date <= Date.now()
                    && this.expired_date >= Date.now()
            }
        };

      return this.find({...filter,owner})
        .populate(planPopulate)
        .sort({createdAt: -1 })
        .exec();
    },

    expirePlan(){

        const filter =
        {
            $where: function () {
                return this.expired_date <= Date.now()
            }
        };

      return this.find(filter)
        .populate(planPopulate)
        .sort({createdAt: -1 })
        .exec();
    },
  
})

schema.plugin(uniqueValidator);

module.exports = mongoose.model('PosPlan', schema);



