import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class StrapiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  request(method, endpoint, body) {
    return this.api[method](endpoint, body);
  }

  landingPage() {
    return this.api.get(`/landingPage`);
  }
  getBlog(id) {
    return this.api.get(`/getBlog?id=${id}`);
  }
  getList(name) {
    return this.api.get(`/getList?name=${name}`);
  }
  getCoreProgramMetrics(params) {
    return this.api.get(`/getCoreProgramMetrics`, {params});
  }
}

export default new StrapiService(`${getBackendUrl()}/strapi`);
