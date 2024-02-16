import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class PlaceService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  getPlaces(params) {
    return this.api.get(`/getAddressAutoPlaces`, {params});
  }
}

export default new PlaceService(`${getBackendUrl()}/place`);
