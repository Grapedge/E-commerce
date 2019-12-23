import React, { Component } from "react";
import { Layout, Result, Button } from "antd";
import { history } from "./Global";
const { Content } = Layout;

export default class SuccessPage extends Component {
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
          <Result
            status="success"
            title="订单支付成功"
            subTitle="期待您的下次购买，由于时间关系，暂时只有商家可以查询到订单"
            extra={[
              <Button
                type="primary"
                key="return"
                onClick={() => history.push("/")}
              >
                返回主页
              </Button>
            ]}
          />
        </Content>
      </Layout>
    );
  }
}
