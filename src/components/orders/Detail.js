import React from 'react';
import { Input,Icon,Button as WebButton,Steps as WebSteps,Badge} from 'antd';
import { Modal,List,Button,Accordion,Steps,Tabs,NoticeBar} from 'antd-mobile';
import {toBig, toHex, clearHexPrefix} from 'LoopringJS/common/formatter'
import config from 'common/config'
import intl from 'react-intl-universal';
import * as datas from 'common/config/data'
import eachLimit from 'async/eachLimit';
import * as orderFormatter from 'modules/orders/formatters'
import Notification from 'LoopringUI/components/Notification'
import {createWallet} from 'LoopringJS/ethereum/account';
import * as uiFormatter from 'modules/formatter/common'
import * as fm from 'LoopringJS/common/formatter'
import QRCode from 'qrcode.react';
import Alert from 'LoopringUI/components/Alert'
import {Pages,Page} from 'LoopringUI/components/Pages'
import {connect} from 'dva'
import routeActions from 'common/utils/routeActions'

const OrderMetaItem = (props) => {
  const {label, value} = props
  return (
    <div className="row ml0 mr0 pt10 pb10 pl15 pr15 zb-b-b no-gutters" style={{padding:'7px 0px'}}>
      <div className="col">
        <div className="fs18 color-black-1 text-left">{label}</div>
      </div>
      <div className="col-auto text-right">
        <div className="fs18 color-black-2 text-wrap text-left">{value}</div>
      </div>
    </div>
  )
}
function OrderDetail(props) {
  const {OrderDetail,dispatch} = props
  const showLayer = (payload={})=>{
    dispatch({
      type:'layers/showLayer',
      payload:{
        ...payload
      }
    })
  }
  const hideLayer = (payload={})=>{
    dispatch({
      type:'layers/hideLayer',
      payload:{
        ...payload
      }
    })
  }
  return (
    <div className="bg-white no-underline">
      <div className="color-black-1 fs22 zb-b-b text-center">
        <div className="row ml0 mr0 pt15 pb15 no-gutters">
          <div className="col text-left pl15 pr15" onClick={hideLayer.bind(this,{id:'orderDetail'})}>
            <Icon type="close"/>
          </div>
          <div className="col-auto">Order Detail</div>
          <div className="col text-left pl15 pr15 color-white">
            <Icon type="close"/>
          </div>
        </div>
      </div>
      <Tabs
        tabs={[
          { title: <div className="text-center">Detail</div> },
          { title: <div className="text-center">Fills</div> },
          { title: <div className="text-center">Logs</div> },
          // { title: <div className="text-center">Status</div> },
        ]}
        tabBarActiveTextColor={"#000"}
        tabBarInactiveTextColor={"rgba(0,0,0,0.35)"}
        swipeable={false}
        initialPage={0}
        onChange={(tab, index) => { console.log('onChange', index, tab); }}
        onTabClick={(tab, index) => { console.log('onTabClick', index, tab); }}
      >
        <div className="bg-white" style={{maxHeight:'75vh',overflow:'auto'}}>
          <div className="">
            { false &&
              <NoticeBar onClick={routeActions.gotoPath.bind(this,'/notifications')} className="text-left t-error s-lg" icon={<Icon type="close-circle"/>} mode="link" marqueeProps={{ loop: true}} action={<span>Enable Order<Icon type="right" /></span>}>
                  该订单无法进行撮合
              </NoticeBar>
            }
            <NoticeBar  onClick={routeActions.gotoPath.bind(this,'/notifications')} className="text-left t-error s-lg" icon={<Icon type="exclamation-circle"/>} mode="link" marqueeProps={{ loop: true}} action={<span>查看余额<Icon type="right" /></span>}>
                余额不足，该订单无法100%被撮合
            </NoticeBar>
            {
              false &&
              <NoticeBar  onClick={routeActions.gotoPath.bind(this,'/notifications')} className="text-left t-info s-lg" mode="link" marqueeProps={{ loop: true}} action={<span>查看日志<Icon type="right" /></span>}>
                  该订单正在进行撮合
              </NoticeBar>
            }
            {
              false &&
              <NoticeBar  className="text-left t-info s-lg" icon={<Icon type="question-circle"/>} mode="link" marqueeProps={{ loop: true}} action={<span>查看原因<Icon type="right" /></span>}>
                  为什么订单没有撮合成交？
              </NoticeBar>
            }

            <OrderMetaItem label="买入" value="10000 LRC" />
            <OrderMetaItem label="成交" value="80% ≈ 8000.00 / 10000.00 LRC" />
            <OrderMetaItem label="卖出" value="25 WETH" />
            <OrderMetaItem label="价格" value="0.00025 WETH" />

            <OrderMetaItem label="矿工撮合费" value="2.2 LRC" />
            <OrderMetaItem label="订单有效时间" value="06-10 10:38 ~ 06-30 10:38" />
            <OrderMetaItem label="订单提交时间" value="06-10 10:38" />
            <Button className="m15 color-white" type="warning">Cancel Order</Button>
          </div>
        </div>
        <div className="p20 bg-white">
          成交记录 todo
        </div>
        <div className="pt15 pl20 pr20 bg-white text-left">
          <div className="pt15 pb0">
            <div className="text-left pt20 pb35 zb-b-b">
             <Steps direction="horizontal" size="" current={1}>
                 <Steps.Step description={<div className="color-black-3 fs14">06-10 10:00</div>} title={<div className="font-weight-normal fs18">Submited</div>} />
                 <Steps.Step description={<div className="color-black-3 fs14">80% filled</div>} title={<div className="font-weight-normal fs18">Matching</div>} />
                 <Steps.Step description={<div className="color-black-3 fs14">Wating</div>} title={<div className="font-weight-normal fs18">Completed</div>} />
             </Steps>
            </div>
          </div>
          <WebSteps progressDot direction="vertical" size="small" current={4}>
              <WebSteps.Step description="2018-06-10 10:00" title="Submited Successfully" />
              <WebSteps.Step description="2018-06-10 18:00" title="Match Successfully" />
              <WebSteps.Step description="2018-06-10 20:00" title="Transfer Starts" />
              <WebSteps.Step description="2018-06-10 21:00" title="Transfer Successfully" />
              { false && <WebSteps.Step title="2018-06-10 22:00" description="Canceled" /> }
              { false && <WebSteps.Step title="2018-06-10 24:00" description="Expired" /> }
          </WebSteps>
          {
            false &&
            <WebSteps progressDot direction="vertical" size="small" current={5}>
                <WebSteps.Step title="Submited Successfully" description="2018-06-10 10:00:00" />
                <WebSteps.Step title="Matching" description={
                  <div>
                    <div className="mb5">Miners are searching matched order</div>
                    <div className="color-red-500 mt5">
                      <Icon type="exclamation-circle-o" /> <span className="">LRC balance is not sufficient .</span>
                    </div>
                    <div className="color-red-500 mt5">
                      <Icon type="exclamation-circle-o" /> <span className="">WETH balance is not sufficient .</span>
                    </div>
                    <Button className="mt5 mr5 d-inline-block" type="warning" size="small">Cancel Order</Button>
                    <Button className="mt5 mr5 d-inline-block" type="warning" size="small">Cancel Order</Button>
                  </div>
                } />
                <WebSteps.Step title="Matched Failed" description={
                  <div>
                    <Icon type="exclamation-circle-o" /> <span className="">Tokens are not enabled to trade.</span>
                  </div>
                } />
                <WebSteps.Step title="Matched Successfully" description={
                  <div>
                    <div className="mb5">Miners found matched order</div>
                  </div>
                } />
                <WebSteps.Step title="Transfering" description={
                  <div>
                    <div className="mb5">Miner is transfering token to your address</div>
                  </div>
                } />
                <WebSteps.Step title="Transfered Successfully" description={
                  <div>
                    <div className="mb5">Your Order is </div>
                  </div>
                } />
                { false && <WebSteps.Step title="Matched Successfully" description="2018-06-15 10:02:23" /> }
                { false && <WebSteps.Step title="Transfer tokens starts" description="2018-06-15 10:04:00" /> }
                { false && <WebSteps.Step title="ETH Network is slow" status="error" description={<div className="fs18">
                </div>} /> }
            </WebSteps>
          }
        </div>
      </Tabs>
    </div>
  )
}
export default connect()(OrderDetail)
