import Joi from "joi";

export default {
  getSheet: Joi.object().keys({
    id: Joi.string().max(60).required(),
    sn: Joi.string().max(30).required()
  })
};