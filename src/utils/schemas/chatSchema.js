const Joi = require("joi");
function chatSchema(data) {
  //user sign up schema (post & put request)
  const schema = Joi.object({
    sender: Joi.string().required(),
    receiver: Joi.string().required(),
    text: Joi.string().min(1).max(400).required(),
  }); 
  return schema.validate(data);
}

module.exports =  chatSchema ;
