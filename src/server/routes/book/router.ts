import { Router } from "express";
import { adminAuthenticator, authenticator } from "../../middlewares/jwt";
import validator, { ValidationSource } from "../../helpers/validator";
import controller from "../../controllers/book";
import schema from "./schema";

const router = Router();

router.get(
  '/:id/tech-stack/:companyId',
  authenticator,
  validator(schema.getTechStackByCompany, ValidationSource.PARAM),
  controller.getTechStackByCompany
);

router.get(
  '/:id',
  adminAuthenticator,
  validator(schema.getBookAdmin, ValidationSource.PARAM),
  controller.getBook
);

router.get(
  '/',
  authenticator,
  controller.getBook
);

export default router;