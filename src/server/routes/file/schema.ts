import Joi from "joi";

export default {
  upload: Joi.object().keys({
    filename: Joi.string().max(120).required()
  }),
  update: Joi.object().keys({
    id: Joi.string().max(50).required(),
    url: Joi.string().max(120)
  }),
  download: Joi.object().keys({
    id: Joi.string().max(50),
  }),
  directdl: Joi.object().keys({
    id: Joi.string().max(50),
    url: Joi.string().max(120).required()
  }),
  metadata: Joi.object().keys({
    id: Joi.string().max(50),
  }),
};