import Joi from "joi";

export default {
  register: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(12).max(128).required(),
  }),
  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(12).max(128).required(),
  }),
  loginAsAdmin: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(12).max(128).required(),
  }),
  refresh: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};