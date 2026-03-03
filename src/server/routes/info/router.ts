import { Router } from "express";
import { adminAuthenticator, authenticator, authKeyAuthenticator } from "../../middlewares/jwt";
import controller from "../../controllers/info";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";

const router = Router();

router.get(
  '/print/:id',
  authKeyAuthenticator,
  validator(schema.getInfoPrint, ValidationSource.PARAM),
  controller.getInfoPrint
);

router.get(
  "/download",
  authenticator,
  controller.download
);

router.get(
  '/:id',
  adminAuthenticator,
  validator(schema.getInfoAdmin, ValidationSource.PARAM),
  controller.getInfoAdmin
);

router.get(
  '/',
  authenticator,
  controller.getInfo
);

export default router;