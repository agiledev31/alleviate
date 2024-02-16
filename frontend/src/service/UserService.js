import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class UserService {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  me() {
    return this.api.get("/me");
  }
}

export default new UserService(`${getBackendUrl()}/user`);
