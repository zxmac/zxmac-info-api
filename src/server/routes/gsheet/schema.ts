import Joi from "joi";

export default {
  getSheet: Joi.object().keys({
    id: Joi.string().max(60).required()
  }),
  getData: Joi.object().keys({
    id: Joi.string().max(60).required(),
    sn: Joi.string().max(30).required()
  }),
  getRawData: Joi.object().keys({
    id: Joi.string().max(60).required(),
    sn: Joi.string().max(30).required()
  }),
};