import Joi from "joi";

export default {
  getBookAdmin: Joi.object().keys({
    id: Joi.string().max(60).required()
  }),
  getTechStackByCompany: Joi.object().keys({
    id: Joi.string().max(60).required(),
    companyId: Joi.string().max(60).required()
  }),
};