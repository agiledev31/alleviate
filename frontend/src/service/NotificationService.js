import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class NotificationService {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  newGrant(data) {
    return this.api.post("/newGrant", {
      ...data,
      origin: window.location.origin,
    });
  }
  updatedGrant(data) {
    return this.api.post("/updatedGrant", {
      ...data,
      origin: window.location.origin,
    });
  }
}

export default new NotificationService(`${getBackendUrl()}/notification`);
