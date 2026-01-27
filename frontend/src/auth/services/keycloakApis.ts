import axios from "axios";
import { getENVData } from "../environment";

export async function tryKeyCloakRefresh(options: any) {
  const url = `${getENVData().keyCloak}/realms/${
    options.realm
  }/protocol/openid-connect/token`;

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const payload = new URLSearchParams({
    refresh_token: options.refresh_token,
    grant_type: options.grant_type,
    client_id: options.sname,
  });

  try {
    const response = await axios.post(url, payload, { headers });
    return response; // ✅ only returns data on success
  } catch (error: any) {
    if (error.response) {
      // server responded with non-200 status
      return {
        success: false,
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // no response received
      return {
        success: false,
        error: "No response from server",
      };
    } else {
      // axios setup error
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export async function tryKeyCloakLogin(options: any) {
  const url = `${getENVData().keyCloak}/realms/${
    options.realm
  }/protocol/openid-connect/token`;

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  console.log(url, "urlllllll");

  const payload = new URLSearchParams({
    username: options.username,
    password: options.password,
    grant_type: options.grant_type,
    client_id: options.sname,
  });
  try {
    const response = axios.post(url, payload, { headers });
    return response;
  } catch (error) {
    console.log(error, "lamoraa");

    return false;
  }
  // send with axios
}

export async function tryKeyCloakLogOut(options: any) {
  const url = `${getENVData().keyCloak}/realms/${
    options.realm
  }/protocol/openid-connect/logout`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const payload = new URLSearchParams({
    refresh_token: options.refresh_token || "",
    client_id: options.sname || "",
  });
  return axios.post(url, payload, { headers });
}
