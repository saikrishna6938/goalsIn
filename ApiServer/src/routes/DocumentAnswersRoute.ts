import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { documentController } from "../controllers/DocumentTypeController";
import { documentAnswers } from "../controllers/DocumentAnswersController";
import { getGroupIndexTypeByTaskId } from "../controllers/Tasks/groupIndexType";

class DocumentAnswersRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}answer/save`,
      documentAnswers.addDocumentAnswerObject
    );
    this.router.post(
      `${keys.basePath}answer/index`,
      documentAnswers.indexDocumentAnswerObject
    );
    this.router.post(
      `${keys.basePath}getobject`,
      documentAnswers.getDocumentAnswerObject
    );
    this.router.post(
      `${keys.basePath}applications`,
      documentAnswers.getApplications
    );
    this.router.post(
      `${keys.basePath}get-application-id`,
      documentAnswers.getUserAndDocumentDetailsByAnswerId
    );
    this.router.post(
      `${keys.basePath}answer/update`,
      documentAnswers.updateDocumentAnswerObject
    );
    // Fetch group index type and name by taskId
    this.router.post(
      `${keys.basePath}task/group-index-type`,
      getGroupIndexTypeByTaskId
    );
    this.router.get(
      `${keys.basePath}task/:taskId/group-index-type`,
      getGroupIndexTypeByTaskId
    );
  }
}

const ir = new DocumentAnswersRoute();
export default ir.router;
