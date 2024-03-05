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

  searchUsers(data) {
    return this.api.post("/searchUsers", data);
  }
  inviteUser(data) {
    return this.api.post(`/inviteUser`, {
      ...data,
      origin: window.location.origin,
    });
  }

  updateUser(id, data) {
    return this.api.put(`/updateUser?id=${id}`, data);
  }
  deleteTeamMember(id) {
    return this.api.delete(`/deleteTeamMember?id=${id}`);
  }
}

export default new UserService(`${getBackendUrl()}/user`);
