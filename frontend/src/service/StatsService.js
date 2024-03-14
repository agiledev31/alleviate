import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class StatsService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  getSurveys(suiteId) {
    return this.api.get(`/getSurveys?suiteId=${suiteId}`);
  }

  getAssessmentSurveys(id) {
    return this.api.get(`/getAssessmentSurveys?id=${id}`);
  }
  getDataSummary(id) {
    return this.api.get(`/getDataSummary?id=${id}`);
  }
}

export default new StatsService(`${getBackendUrl()}/stats`);
