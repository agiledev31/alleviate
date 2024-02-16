import axios from "axios";
import { getBackendUrl } from "./getBackendUrl";
import { middleField } from "./middlefield";

class CloudinaryService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
    });
    middleField(this.api);
  }

  generateSignature({ signatureString }) {
    return this.api.post("/generateSignature", { signatureString });
  }
}

export default new CloudinaryService(`${getBackendUrl()}/cloudinary`);
