const express = require('express')
const Joi = require('joi')

function userSchema(input) { //user sign up schema (post & put request)
    const schema = Joi.object({
        name: Joi.string().min(3).max(16).valid().lowercase().required(),
        username: Joi.string().alphanum().min(3).max(16).required(),
        email: Joi.string().email().required(),
        password: Joi.string().alphanum().min(3).max(16).required(),
    })
    return schema.validate(input)
}

function userPatchSchema(input) { //user info edit schema (patch request) 
    const schema = Joi.object({
        name: Joi.string().min(3).max(16).lowercase(),
        username: Joi.string().alphanum().min(3).max(16),
        email: Joi.string().email(),
        password: Joi.string().alphanum().min(3).max(16).required(),
    })
    return schema.validate(input)
}

function friendsSchema(input) { //sending friend requests
    const schema = Joi.object({
        userId: Joi.number().required(),
        friendId: Joi.number().required()
    })
    return schema.validate(input)
}

function acceptFriendSchema(input) { //for friend requests (put request)
    const schema = Joi.object({
        userId: Joi.number().required(),
        friendId: Joi.number().required(),
        acceptRequest: Joi.boolean().required()
    })
    return schema.validate(input)
}

function userChatsSchema(input){
    const schema = Joi.object({ 
        password: Joi.string().alphanum().min(3).max(16).required(),
    })
    return schema.validate(input)
}

function friendsSchemaWithUsername(input){ //for chatting validation of the username and friendId
    const schema = Joi.object({
        friendId : Joi.string().alphanum().required(),
        username: Joi.string().alphanum().required() //the username is the friend username not the user's own
    })
    return schema.validate(input)
}

function userChatsWithFriendSchema(input){
    const schema = Joi.object({
        texts: Joi.string().required() //this is the chat(texts) between the user and the friend
    })
    return schema.validate(input)
}

module.exports ={userSchema,userPatchSchema,friendsSchema,acceptFriendSchema,userChatsSchema,
    friendsSchemaWithUsername,userChatsWithFriendSchema
}