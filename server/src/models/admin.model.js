const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

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
    email : {
        type : String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:  {
        type:String,    
        required: true,
    },
    avatar: {
        type: String,
        required: false
    },
    role: {
        type: Number,
        default: 0
    },
    admin_id: Number,
    access_token: String
},{
    timestamps: true,
})

schema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
      try {
        const lastDoc = await mongoose.model('Admin', schema)
          .findOne({}, {}, { sort: { admin_id: -1 } }).exec();
  
        doc.admin_id = lastDoc ? lastDoc.admin_id + 1 : 1;
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
            'role',
            'createdAt'
        ]
        let transformed = {}

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        transformed["id"] = this['admin_id']

        return transformed
    }
})

schema.statics = ({

    list({page = 1, per_page = 10, lang = 'en'}){
  
      let select = "name email phone admin_id avatar role createdAt"
  
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

module.exports = mongoose.model('Admin', schema);



