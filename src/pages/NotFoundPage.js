import React from "react";

export default class NotFoundPage extends React.Component {
  componentDidMount() {
    const script = document.createElement("script");
    script.src =
      "//qzonestyle.gtimg.cn/qzone/hybrid/app/404/search_children.js";
    script.async = true;
    script.charset = "utf-8";
    script.setAttribute("homePageUrl", "/");
    script.setAttribute("homePageName", "返回主页");
    document.getElementById('404').appendChild(script);
  }

  render() {
    return (
      <div
        title="404"
        id="404"
        style={{
          width: "100%",
          height: "100vh",
          border: "none"
        }}
      ></div>
    );
  }
}
