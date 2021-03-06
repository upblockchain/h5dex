import React from 'react';
import { List, InputItem,Button,WingBlank,Slider, Tabs, WhiteSpace, Badge,SegmentedControl, NavBar, Icon,Modal,Switch,Steps } from 'antd-mobile';
import { Icon as WebIcon,Switch as WebSwitch } from 'antd';
import { createForm } from 'rc-form';
import { connect } from 'dva';
import Containers from 'modules/containers';
import UiContainers from 'LoopringUI/containers'
import routeActions from 'common/utils/routeActions'
import commonFm from 'modules/formatter/common'
import intl from 'react-intl-universal'
import {OrderFm} from 'modules/orders/OrderFm'

export const OpenOrderList = ({orders={},dispatch})=>{
  const gotoDetail= (item)=>{
      dispatch({
        type:'layers/showLayer',
        payload:{
          id:'orderDetail',
          order:item,
        }
      })
    }
  return (
    <table className="w-100 fs13" style={{overflow:'auto'}}>
      <thead>
        <tr>
          <th className="text-left pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">{intl.get('common.price')}</th>
          <th className="text-left pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">{intl.get('common.amount')}</th>
          <th className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">{intl.get('order.filled')}</th>
          <th hidden className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">{intl.get('common.lrc_fee')}</th>
          <th className="text-center pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">{intl.get('common.status')}</th>
        </tr>
      </thead>
      <tbody>
        {
          orders.items && orders.items.map((item,index)=>{
            const orderFm = new OrderFm(item)
            const tokens = orderFm.getTokens()
            const market = orderFm.getMarketPair()
            return (
              <tr key={index} className="color-black-2" onClick={gotoDetail.bind(this,item)}>
                <td className="zb-b-b p10 pl10 text-left">
                  { orderFm.getSide() === 'buy' &&
                    <span className="color-success">
                      <div>{orderFm.getPrice()}</div>
                      <div className="color-black-3">{market}</div>
                    </span>
                  }
                  { orderFm.getSide() === 'sell' &&
                    <span className="color-error">
                      <div>{orderFm.getPrice()}</div>
                      <div className="color-black-3">{market}</div>
                    </span>
                  }
                </td>
                <td className="zb-b-b p10 text-left text-nowrap">
                  <div>{orderFm.getAmount()}</div>
                  <div className="color-black-3">{tokens.left}</div>
                </td>
                <td className="zb-b-b p10 text-right text-nowrap">{orderFm.getFilledPercent()}%</td>
                <td hidden className="zb-b-b p10 text-right text-nowrap">{orderFm.getLRCFee()}</td>
                <td className="zb-b-b p10 text-center">
                  {renders.status(orderFm,item.originalOrder)}
                </td>
              </tr>
            )
          })
        }
        {
          orders.items && orders.items.length === 0 &&
          <tr><td colSpan='100'><div className="text-center pt10 pb10 color-black-4 fs12">{intl.get('common.list.no_data')}</div></td></tr>
        }
        {
          false &&
          <tr hidden className="color-black-2">
            <td colSpan={10} className="zb-b-b p15 text-center">
                <Button className="color-grey-600">All Orders</Button>
            </td>
          </tr>
        }

      </tbody>
    </table>
  )
}
export const HistoryOrderList = ()=>{
  return (
    <table className="w-100 fs16">
      <thead>
        <tr>
          <th hidden className="text-center pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Side</th>
          <th className="text-left pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Price</th>
          <th className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Amount</th>
          <th className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Filled</th>
          <th className="text-right pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Fee</th>
          <th className="text-center pl10 pr10 pt5 pb5 font-weight-normal color-black-3 zb-b-b">Status</th>
        </tr>
      </thead>
      <tbody>
        {
          [1,2,3,4,5,6,7,8,9].map((item,index)=>
            <tr key={index} className="color-black-2">
              <td hidden className="zb-b-b p10 text-center">
                {index%2 === 0 && <span className="color-success">Buy</span>}
                {index%2 === 1 && <span className="color-error">Sell</span>}
              </td>
              <td className="zb-b-b p10 pl10 text-left">
                {index%2 === 0 && <span className="color-success">0.00095000</span>}
                {index%2 === 1 && <span className="color-error">0.00095000</span>}
              </td>
              <td className="zb-b-b p10 text-right">1000.0000</td>
              <td className="zb-b-b p10 text-right">80%</td>
              <td className="zb-b-b p10 text-right">2.5 LRC</td>
              <td className="zb-b-b p10 text-center">
                { index%3 === 0 && <WebIcon className="zb-b-b color-success" type="check-circle" /> }
                { index%3 === 1 && <WebIcon className="zb-b-b color-black-4" type="close-circle" /> }
                { index%3 === 2 && <WebIcon className="zb-b-b color-black-4" type="clock-circle" /> }
              </td>
            </tr>
          )
        }
        {
          [].length === 0 &&
          <tr><td colSpan='100'><div className="text-center pt10 pb10 color-black-4 fs12">{intl.get('common.list.no_data')}</div></td></tr>
        }
        <tr hidden className="color-black-2">
          <td colSpan={10} className="zb-b-b p15 text-center">
              <Button className="color-grey-600">All Orders</Button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export const renders = {
  hash: (fm, actions) => (
    <a className="text-primary"
       onCopy={null}
       onClick={actions && actions.gotoDetail}
    >
      {commonFm.getShortAddress(fm.getOrderHash())}
    </a>
  ),
  side: (fm) => (
    <div>
      {fm.getSide() === 'buy' &&
      <span className="text-success">{intl.get(`common.${fm.getSide()}`)}</span>
      }
      {fm.getSide() === 'sell' &&
      <span className="text-error">{intl.get(`common.${fm.getSide()}`)}</span>
      }
    </div>
  ),
  status: (fm, order, cancelOrder) => {
    const status = fm.getStatus();
    if (status === 'ORDER_OPENED') {
      if(cancelOrder) {
        return <a className="fs12" onClick={cancelOrder}>{intl.get("common.cancel")}</a>
      } else {
        return <span className="text-primary">{intl.get("order_status.opened")}</span>
      }
    }
    if (status === 'ORDER_FINISHED') {
      return <span className="color-success"><WebIcon type="check-circle" /></span>
    }
    if (status === 'ORDER_CANCELLED') {
      return <span className="color-black-4">{intl.get("order_status.canceled")}</span>
    }
    if (status === 'ORDER_CUTOFF') {
      return <span className="color-black-4">{intl.get("order_status.canceled")}</span>
    }
    if (status === 'ORDER_EXPIRE') {
      return <span className="color-black-4">{intl.get("order_status.expired")}</span>
    }
    if (status === 'ORDER_PENDING') {
      return <span className="color-black-1">{intl.get("order_status.pending")}</span>
    }
    if (status === 'ORDER_CANCELLING') {
      return <span className="color-black-1">{intl.get("order_status.canceling")}</span>
    }
  },
}
