import React, { Component } from "react";
import { Icon, Upload, message } from "antd";
import { fetchRoot } from "./pages/Config";

export default class UploadImage extends Component {
  state = {
    loading: false
  };

  beforeUpload(file) {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("只允许上传 JPG/PNG 文件");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("文件大小需要小于 2MB");
    }
    return isJpgOrPng && isLt2M;
  }

  handleChange = info => {
    if (info.file.status === "uploading") {
      this.setState({ loading: true });
      return;
    } else if (info.file.status === "error") {
      message.error("上传失败");
      this.setState({ loading: false });
    } else if (info.file.status === "done") {
      this.setState({
        loading: false
      });
      this.props.onUpload(info.file.response);
    }
  };

  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? "loading" : "plus"} />
        <div>{this.props.uploadText || "上传"}</div>
      </div>
    );

    const { imageUrl } = this.props;

    return (
      <Upload
        name="image"
        listType="picture-card"
        className={this.props.className}
        showUploadList={false}
        action={`${fetchRoot}/images/upload`}
        beforeUpload={this.beforeUpload}
        headers={{ Authorization: `Bearer ${localStorage.getItem("token")}` }}
        onChange={this.handleChange}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="上传图片" style={this.props.style} />
        ) : (
          uploadButton
        )}
      </Upload>
    );
  }
}
