import React, { Component } from "react";
import { Layout, List, Avatar, Spin, message } from "antd";
import { Link } from "react-router-dom";
import { fetchRoot } from "./Config";
const { Content } = Layout;


export default class MainPage extends Component {
  state = {
    shops: [],
    spinning: true
  }
  _isMounted = false;
  componentDidMount() {
    this._isMounted = true;
    fetch(`${fetchRoot}/public/get-shops`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.code === 0 && this._isMounted) {
          this.setState({
            shops: json.obj,
            spinning: false
          });
        } else {
          message.error("加载数据出错");
        }
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <Layout
        style={{
          padding: "24px 0",
          background: "#fff",
          marginTop: "46px"
        }}
      >
        <Content style={{ padding: "0 24px", minHeight: 280 }}>
        <Spin spinning={this.state.spinning} tip="Loading...">
          <List
            itemLayout="vertical"
            size="large"
            pagination={{
              onChange: () => {},
              pageSize: 5
            }}
            dataSource={this.state.shops}
            renderItem={item => (
              <List.Item
                key={item.id}
                actions={[]}
                extra={
                  <img width={236} height={132} alt="logo" src={item.logo} />
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.owner.avatar} className="avatar" />}
                  title={<Link to={`/shop/${item.owner.phone}`}>{item.name}</Link>}
                  description={`${item.owner.desc} 手机：${item.owner.phone}`}
                />
                {item.desc.substr(0, 70)}
              </List.Item>
            )}
          ></List>
          </Spin>
        </Content>
      </Layout>
    );
  }
}
