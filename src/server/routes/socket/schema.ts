import Joi from "joi";

export default {
  getUser: Joi.object().keys({
    id: Joi.string().max(60).required()
  }),
};