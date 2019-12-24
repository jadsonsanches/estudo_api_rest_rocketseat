const mongoose = require('mongoose');
const db = "mongodb+srv://jadsonsanches:<password>@apirestrocketseatcluster-e8pr3.gcp.mongodb.net/api_rest_rocketseat?retryWrites=true&w=majority"

mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(db, err => {
    if(err) console.error('Error! ' + err);
    else console.log('Connected to mongodb');
});

module.exports = mongoose;