import { Router } from "express";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";
import controller from "../../controllers/file";

const router = Router();

router.post(
  "/upload/:filename",
  validator(schema.upload, ValidationSource.PARAM),
  controller.upload
);

router.post(
  "/update",
  validator(schema.update, ValidationSource.BODY),
  controller.update
);

router.get(
  "/download/:id",
  validator(schema.download, ValidationSource.PARAM),
  controller.download
);

router.post(
  "/directdl",
  validator(schema.directdl, ValidationSource.BODY),
  controller.directdl
);

router.get(
  "/metadata/:id",
  validator(schema.metadata, ValidationSource.PARAM),
  controller.metadata
);

export default router;