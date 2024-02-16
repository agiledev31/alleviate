import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class DashboardService {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  getDashboardDetails() {
    return this.api.get("/getDashboardDetails");
  }
}

export default new DashboardService(`${getBackendUrl()}/dashboard`);
