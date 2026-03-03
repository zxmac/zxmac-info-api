import Joi from "joi";

export default {
  processSync: Joi.object().keys({
    id: Joi.string().max(60).required(),
    sn: Joi.string().max(30).required()
  })
};