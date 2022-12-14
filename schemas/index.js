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

function userPatchSchema(input) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(16).lowercase(),
        username: Joi.string().alphanum().min(3).max(16),
        email: Joi.string().email(),
    })
    return schema.validate(input)
}

module.exports ={userSchema,userPatchSchema}