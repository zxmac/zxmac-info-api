import Joi from "joi";

export default {
  getInfoAdmin: Joi.object().keys({
    id: Joi.string().max(120).required()
  }),
  getInfoPrint: Joi.object().keys({
    id: Joi.string().max(120).required()
  })
};