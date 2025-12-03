import { Router } from "express";
import { documentAnswers } from "../controllers/DocumentAnswersController";
import { withBasePath } from "../utils/routeHelpers";
import { getGroupIndexTypeByTaskId } from "../controllers/Tasks/groupIndexType";

class DocumentAnswersRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("answer/save"), documentAnswers.addDocumentAnswerObject);
    this.router.post(withBasePath("answer/index"), documentAnswers.indexDocumentAnswerObject);
    this.router.post(withBasePath("getobject"), documentAnswers.getDocumentAnswerObject);
    this.router.post(withBasePath("applications"), documentAnswers.getApplications);
    this.router.post(
      withBasePath("get-application-id"),
      documentAnswers.getUserAndDocumentDetailsByAnswerId
    );
    this.router.post(withBasePath("answer/update"), documentAnswers.updateDocumentAnswerObject);
    this.router.post(withBasePath("task/group-index-type"), getGroupIndexTypeByTaskId);
    this.router.get(withBasePath("task/:taskId/group-index-type"), getGroupIndexTypeByTaskId);
  }
}

const documentAnswersRoute = new DocumentAnswersRoute();
export default documentAnswersRoute.router;
