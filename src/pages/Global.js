import { message } from "antd";
import { createBrowserHistory } from "history";
import { fetchRoot } from "./Config";

export const history = createBrowserHistory();

export function relogin() {
  localStorage.removeItem("token");
  message.info("登录信息失效，请重新登录");
  setTimeout(() => {
    history.push("/login");
  }, 2000);
}

export function privateFetch(url, params) {
  const token = localStorage.getItem("token") || "";
  params = Object.assign(params, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  return fetch(`${fetchRoot}${url}`, params)
    .then(res => {
      return res.json();
    })
    .then(json => {
      if (json.code === -128) {
        localStorage.removeItem("token");
        relogin();
      }
      return json;
    })
    .catch(e => {
      console.log(e);
      return {
        code: -127,
        msg: "error",
        obj: null
      };
    });
}
