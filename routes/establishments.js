const { check, validationResult } = require('express-validator');
const mongodb = require('mongodb');
const mongoData = require('../keys.json').db.mongo;

const establishmentValues = [
    "coordinateX",
    "coordinateY",
    "name",
    "address",
    "deliveryTime",
    "deliveryCost",
    "paymentMethods",
    "type",
    "categories"
];

module.exports.getValidator = [
    check('id').isHexadecimal().isLength(24)
];

module.exports.get = (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let collection = client.db('users').collection('establishments');
            collection.findOne({ "_id" : mongodb.ObjectId(req.params.id)},(error, docs) => {
                if (error) next(error);
                client.close();
                res.send(docs);
            });
        });
    }else{
        res.status(400).send(errors);
    }
};

module.exports.getByFilterValidator = [
    check('coordinateX').isDecimal(),
    check('coordinateY').isDecimal()
];

module.exports.getByFilter = (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        let filter = {};
        filter.coordinateX = {'$gt' : parseFloat(req.query.coordinateX)-0.05, '$lt' : parseFloat(req.query.coordinateX)+0.05};
        filter.coordinateY = {'$gt' : parseFloat(req.query.coordinateY)-0.05, '$lt' : parseFloat(req.query.coordinateY)+0.05};
        if(req.query.minimumScore){
            filter.score = {'$gte' : parseInt(req.query.minimumScore)}
        }
        if(req.query.maximumDeliveryTime){
            filter.deliveryTime = {'$lte' : parseInt(req.query.maximumDeliveryTime)}
        }
        if(req.query.maximumDeliveryCost){
            filter.deliveryCost = {'$lte' : parseInt(req.query.maximumDeliveryCost)}
        }
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let collection = client.db('users').collection('establishments');
            collection.find(filter).toArray((error, docs) => {
                if (error) next(error);
                client.close();
                res.send(docs);
            });
        });
    }else{
        res.status(400).send(errors);
    }
};

module.exports.createValidator = [
    check('coordinateX').isDecimal(),
    check('coordinateY').isDecimal(),
    check('name').isString(),
    check('address').isString(),
    check('deliveryTime').isInt(),
    check('deliveryCost').isInt(),
    check('paymentMethods').isArray(),
    check('type').isString(),
    check('categories').isArray()
];

module.exports.create = (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let data = {};
            for(let i of establishmentValues){
                let v = req.body[i];
                if(v) data[i] = v;
            }
            data.messages = [];
            data.score = 0;
            data.nMessages = 0;
            let collection = client.db('users').collection('establishments');
            collection.insertOne(data,(error,result)=>{
                if (error) next(error);
                client.close();
                res.send(result.ops);
            });
        });
    }else{
        res.status(400).send(errors);
    }
};

module.exports.setValidator = [
    check('coordinateX').isDecimal().optional(),
    check('coordinateY').isDecimal().optional(),
    check('name').isString().optional(),
    check('address').isString().optional(),
    check('deliveryTime').isInt().optional(),
    check('deliveryCost').isInt().optional(),
    check('paymentMethods').isArray().optional(),
    check('type').isString().optional(),
    check('categories').isArray().optional()
];

module.exports.set = (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let data = {};
            for(let i of establishmentValues){
                let v = req.body[i];
                if(v) data[i] = v;
            }
            let collection = client.db('users').collection('establishments');
            collection.updateOne({ "_id" : mongodb.ObjectId(req.params.id)},{ "$set": data},(error, result)=>{
                if(error) next(error);
                res.status(204).end();
            });
        });
    }else{
        res.status(400).send(errors);
    }
};

const messageStructure = [
    "text",
    "score",
    "posterId"
]

module.exports.addMessageValidator = [
    check('text').isString(),
    check('score').isInt(),
    check('posterId')
]

module.exports.addMessage = (req,res,next) => {
    const errors = validationResult(req);
    if(errors.isEmpty() && req.body.score>0 && req.body.score<=5){
        let data = {};
        for(let i of messageStructure){
            let v = req.body[i];
            if(v) data[i] = v;
        }
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let collection = client.db('users').collection('establishments');
            collection.findOne({ "_id" : mongodb.ObjectId(req.params.id)},(error, docs) => {
                if(error) next(error);
                collection.updateOne({ "_id" : mongodb.ObjectId(req.params.id)},{"$set" : {"nMessages" : docs.nMessages+1, "score" : (docs.score*docs.nMessages+req.body.score)/(docs.nMessages+1)}},(error, result)=>{
                    if(error) next(error);
                    collection.updateOne({ "_id" : mongodb.ObjectId(req.params.id)},{"$push" : {"messages" : data}},(error, result)=>{
                        if(error) next(error);
                        res.status(204).end();
                    });
                });
            });
        });
    }else{
        res.status(400).send(errors);
    }
};