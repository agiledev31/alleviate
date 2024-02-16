import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class GarbageService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  approveCompanyApplication() {
    return this.api.put("/approveCompanyApplication");
  }
  rejectCompanyApplication() {
    return this.api.delete("/rejectCompanyApplication");
  }
}

export default new GarbageService(`${getBackendUrl()}/garbage`);
