const { check, validationResult } = require('express-validator');
const mongodb = require('mongodb');
const mongoData = require('../keys.json').db.mongo;

const user = {
    name : null,
    lastname : null,
    email : null
}

module.exports.getValidator = [
    check('id').isHexadecimal().isLength(24)
];

module.exports.get = (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let collection = client.db('users').collection('clients');
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

module.exports.createValidator = [
    check('name').isString(),
    check('lastname').isString(),
    check('email').isEmail()
];

module.exports.create = (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let data = {};
            for(let i in user){
                let v = req.body[i];
                if(v) data[i] = v;
            }
            let collection = client.db('users').collection('clients');
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
    check('id').isHexadecimal().isLength(24),
    check('name').isString().optional(),
    check('lastname').isString().optional(),
    check('email').isEmail().optional()
];

module.exports.set = (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
        mongodb.MongoClient.connect(mongoData.url,mongoData.options,(error,client)=>{
            if(error) next(error);
            let data = {};
            for(let i in user){
                let v = req.body[i];
                if(v) data[i] = v;
            }
            let collection = client.db('users').collection('clients');
            collection.updateOne({ "_id" : mongodb.ObjectId(req.params.id)},{ "$set": data},(error, result)=>{
                if(error) next(error);
                res.status(204).end();
            });
        });
    }else{
        res.status(400).send(errors);
    }
};