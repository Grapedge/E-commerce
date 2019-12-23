import React, { Component } from "react";
import {
  Input,
  message,
  Button,
  Spin
} from "antd";
import UploadImage from "../UploadImage";
import { privateFetch, history } from "./Global";

export default class UserPage extends Component {
  state = {
    user: {},
    modifying: false,
    loading: true
  };
  input = this.props.user || {
    nickname: "",
    desc: "",
    avatar: ""
  };

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.input[name] = value;
    this.setState({
      user: this.input
    });
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    privateFetch("/user", {
      method: "post"
    }).then(json => {
      if (json.code === 0) {
        this.input = json.obj;
        this.setState({
          user: json.obj,
          loading: false
        });
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  onModify = () => {
    this.setState({
      modifying: true
    });
    const { nickname, desc, avatar } = this.input;
    let success = true;
    if (nickname.length > 8 || nickname.length < 1) {
      success = false;
      message.error("用户名长度非法");
    }
    if (desc.length === 0 || desc.length > 100) {
      success = false;
      message.error("请输入正确的描述");
    }
    if (avatar.length === 0) {
      success = false;
      message.error("请上传用户头像");
    }
    if (success) {
      privateFetch("/modify-user", {
        method: "post",
        body: JSON.stringify(this.input)
      }).then(json => {
        if (!this._isMounted) return;
        this.setState({
          modifying: false
        });
        if (json.code === 0) {
          message.success(json.msg);
          history.push('/user');
        } else {
          message.error(json.msg);
        }
      });
    } else {
      this.setState({
        modifying: false
      });
    }
  };

  render() {
    const { nickname, desc, avatar } = this.state.user;
    return (
      <Spin spinning={this.state.loading} loading="Loading...">
        <br />
        <Input
          name="nickname"
          placeholder="昵称"
          defaultValue={nickname || ""}
          value={nickname}
          onChange={this.handleInputChange}
        />
        <br />
        <br />
        <Input
          name="desc"
          placeholder="自我介绍..."
          defaultValue={desc}
          value={desc}
          onChange={this.handleInputChange}
        />
        <br />
        <br />
        <UploadImage
          className="image-uploader"
          uploadText="上传头像"
          name="avatar"
          imageUrl={avatar}
          onUpload={json => {
            this.input["avatar"] = json.obj;
            this.setState({avatar: json.obj})
          }}
          style={{ width: "126px", height: "126px" }}
        />
        <Button
          type="primary"
          block
          loading={this.state.modifying}
          onClick={this.onModify}
        >
          保存用户信息
        </Button>
      </Spin>
    );
  }
}
