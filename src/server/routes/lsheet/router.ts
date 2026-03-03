import { Router } from "express";
import controller from "../../controllers/lsheet";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";

const router = Router();

router.get(
  '/:id/:sn/', 
  validator(schema.getSheet, ValidationSource.PARAM),
  controller.getSheet
);

export default router;