import axios from "axios";
import {
  tryKeyCloakLogin,
  tryKeyCloakLogOut,
  tryKeyCloakRefresh,
} from "./services/keycloakApis";

export const setTokenToLocalStorage = (token: string) => {
  localStorage.setItem("token", token);
};

interface tryKeyCloakLoginOptions {
  realm?: string;
  sname?: string;
  grant_type?: "password" | "refresh_token";
  username?: string;
  password?: string;
  refresh_token?: string;
}

export const getTokenFromLocalStorage = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return JSON.parse(token);
  }
  return null;
};

export const removeTokenToLocalStorage = () => {
  localStorage.removeItem("token");
  axios.defaults.headers.common["Authorization"] = "";
};

export const tryLogin = async (options: any): Promise<boolean> => {
  const payload: tryKeyCloakLoginOptions = {
    username: options.username,
    password: options.password,
    grant_type: "password",
    sname: "civic",
    realm: "civic",
  };
  const login: any = await tryKeyCloakLogin(payload);

  console.log(login, "login.data");
  if (login.status === 200) {
    setTokenToLocalStorage(JSON.stringify(login.data));
    return true;
  } else {
    return false;
  }
};

export const verifyToken = async (): Promise<boolean> => {
  const tokenInfo = getTokenFromLocalStorage();
  if (!tokenInfo) {
    return false;
  }
  const payload: tryKeyCloakLoginOptions = {
    refresh_token: tokenInfo.refresh_token,
    grant_type: "refresh_token",
    sname: "civic",
    realm: "civic",
  };
  const login: any = await tryKeyCloakRefresh(payload);
  // debugger
  console.log(login, "login");

  if (login.status === 200) {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${login.data.access_token}`;
    setTokenToLocalStorage(JSON.stringify(login.data));
    return true;
  } else {
    return false;
  }
};

export const tryLogout = async (): Promise<boolean> => {
  const token = getTokenFromLocalStorage();
  if (!token) {
    return false;
  }
  const refresh_token = token.refresh_token;
  const payload: tryKeyCloakLoginOptions = {
    refresh_token: refresh_token,
    grant_type: "refresh_token",
    sname: "civic",
    realm: "civic",
  };
  const login = await tryKeyCloakLogOut(payload);
  if (login.status === 204) {
    removeTokenToLocalStorage();
    return true;
  } else {
    return false;
  }
};
