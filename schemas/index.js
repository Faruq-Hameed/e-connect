const express = require('express')
const Joi = require('joi')

function userSchema(input) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(16).lowercase().required(),
        username: Joi.string().alphanum().min(3).max(16).required(),
        email: Joi.string().email().required(),
        password: Joi.string().alphanum().min(3).max(16).required(),
    })
    return schema.validate(input)
}

// {id : 1, name: 'admin', :'admin1', email: 'admin@mail.com', password: 'Password1', friendsId:[3,4]},


module.exports ={userSchema}