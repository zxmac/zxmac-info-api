import { Router } from "express";
import controller from "../../controllers/task";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";

const router = Router();

router.get(
  '/sync/:id', 
  validator(schema.processSync, ValidationSource.PARAM),
  controller.processSync
);

export default router;