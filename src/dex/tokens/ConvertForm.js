import React from 'react'
import { Button, List, NavBar, Toast,Modal,InputItem} from 'antd-mobile'
import { Icon as WebIcon, Input } from 'antd'
import { connect } from 'dva'
import routeActions from 'common/utils/routeActions'
import { toHex, toBig, toNumber } from '../../common/loopringjs/src/common/formatter'
import Contracts from '../../common/loopringjs/src/ethereum/contracts/Contracts'
import TokenFormatter, { getBalanceBySymbol, getPriceBySymbol, isValidNumber } from '../../modules/tokens/TokenFm'
import config from '../../common/config'
import intl from 'react-intl-universal'
import storage from 'modules/storage'
import Worth from 'modules/settings/Worth'
import {signTx,signMessage} from '../../common/utils/signUtils'
import Notification from 'LoopringUI/components/Notification'
import ConvertHelperOfBalance from './ConvertHelperOfBalance'


const WETH = Contracts.WETH
const Item = List.Item
const Brief = Item.Brief

// 通过自定义 moneyKeyboardWrapProps 修复虚拟键盘滚动穿透问题
// https://github.com/ant-design/ant-design-mobile/issues/307
// https://github.com/ant-design/ant-design-mobile/issues/163
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  }
}

class Convert extends React.Component {
  state={
    token:'ETH'
  }

  componentDidMount(){
    const {convertToken} = this.props;
    if(convertToken && convertToken.token){
      this.setState({token:convertToken.token})
    }
  }


  render () {
    const {dispatch, balance, amount,gas} = this.props
    const {token} = this.state;
    const address = storage.wallet.getUnlockedAddress()
    const assets = getBalanceBySymbol({balances: balance.items, symbol: token, toUnit: true})
    const gasPrice = gas.tabSelected === 'estimate' ? gas.gasPrice.estimate : gas.gasPrice.current
    const gasLimit = token.toLowerCase() === 'eth' ? config.getGasLimitByType('deposit').gasLimit : config.getGasLimitByType('withdraw').gasLimit
    const tf = new TokenFormatter({symbol: token})
    const gasFee = toBig(gasPrice).times(gasLimit).div(1e9)
    const showLayer = (payload = {}) => {
      dispatch({
        type: 'layers/showLayer',
        payload: {
          ...payload
        }
      })
    }
    const hideLayer = (payload = {}) => {
      dispatch({
        type: 'layers/hideLayer',
        payload: {
          ...payload
        }
      })
    }
    const setGas = () => {
      showLayer({
        id: 'helperOfGas',
        gasLimit
      })
    }

    const setMax = () => {
      let max = assets.balance
      if (token === 'ETH') {
        max = toBig(assets.balance).minus(gasFee).minus(0.1).isPositive() ? toBig(assets.balance).minus(gasFee).minus(0.1) : toBig(0)
      }
      dispatch({type: 'convert/setMax', payload: {amount: max, amount1: max}})
    }
    const gotoConfirm = async () => {
      if (!isValidNumber(amount)) {
        Toast.info(intl.get('notifications.title.invalid_number'))
        return
      }

      if (toBig(amount).plus(gasFee).gt(assets.balance)) {
        Toast.info(intl.get('convert.not_enough_tip',{token}))
        return
      }
      let data = ''
      let value = ''
      if (token.toLowerCase() === 'eth') {
        data = WETH.encodeInputs('deposit')
        value = toHex(tf.getDecimalsAmount(amount))
      } else {
        data = WETH.encodeInputs('withdraw', {wad: toHex(tf.getDecimalsAmount(amount))})
        value = '0x0'
      }
      const to = config.getTokenBySymbol('WETH').address
      const tx = {
        gasLimit,
        data,
        to,
        gasPrice: toHex(toBig(gasPrice).times(1e9)),
        chainId: config.getChainId(),
        value,
        nonce: toHex((await window.RELAY.account.getNonce(address)).result)
      }

      signTx(tx).then(res => {
        if (res.result) {
          window.ETH.sendRawTransaction(res.result).then(resp => {
            if (resp.result) {
              window.RELAY.account.notifyTransactionSubmitted({
                txHash: resp.result,
                rawTx: tx,
                from: address
              })
              Toast.success(intl.get('notifications.title.convert_suc'))
              hideLayer({id:'convertToken'})
            }else{
              Toast.fail(intl.get('notifications.title.convert_fail')+":"+resp.error.message)
            }
          })
        }else{
          Toast.fail(intl.get('notifications.title.convert_fail')+":"+res.error.message)
        }
      })
    }
    const amountChange = (e) => {
        dispatch({type:'convert/amountChange',payload:{amount:e.target.value}})
    }
    const swap = () => {
      const {token} = this.state
      if (token.toLowerCase() === 'eth') {
        this.setState({token: 'WETH'})
      } else {
        this.setState({token: 'ETH'})
      }
    }
    const handleClick = () => {
        this.inputRef.focus();
    }
    return (
      <div className="bg-white">
        <NavBar
          className="zb-b-b"
          mode="light"
          onLeftClick={()=>hideLayer({id:'convertToken'})}
          leftContent={[
            <span key='1' className=""><WebIcon type="close"/></span>,
          ]}
          rightContent={null && [
            <WebIcon key="1" type="question-circle-o"/>,
          ]}
        >
          {intl.get('common.convert')}
        </NavBar>
        <div className="zb-b-b">
          <div className="p15">
            <div className="row ml0 mr0 no-gutters align-items-stretch justify-content-center">
              <div className="col text-left">
                <div className="color-black-2 fs14">{token}</div>
              </div>
              <div className="col-auto text-center" onClick={swap} style={{width: '44px'}}>
              </div>
              <div className="col text-right">
                <div className="color-black-2 fs14">{token.toLowerCase() === 'eth' ? 'WETH' : 'ETH'}</div>
              </div>
            </div>
            <div className="zb-b row ml0 mr0 no-gutters align-items-stretch justify-content-center">
              <div className="col text-right no-border am-list-bg-none bg-grey-100">
                <List >
                    <InputItem
                      type="digit"
                      onClick={()=>{this.inputRef.focus()}}
                      ref={el => this.inputRef = el}
                      defaultValue="0"
                    >
                    </InputItem>
                </List>
                {
                  false &&
                  <Input prefix={token} className="text-right" type="text" onChange={amountChange} value={amount}/>
                }
              </div>
              <div className="col-auto text-center zb-b d-flex align-items-center justify-content-center" onClick={swap} style={{width: '44px'}}>
                <WebIcon type="swap" className="fs20 text-primary" />
              </div>
              <div className="col text-left no-border am-list-bg-none bg-grey-100">
                <List>
                    <InputItem
                      type="digit"
                      defaultValue="0"
                      clear
                      disabled={true}
                    ></InputItem>
                </List>
                {
                  false &&
                  <Input suffix={token.toLowerCase() === 'eth' ? 'WETH' : 'ETH'} className="text-left" type="text" onChange={amountChange} value={amount}/>
                }
              </div>
            </div>

            <div className="row ml0 mr0 mt20 no-gutters" onClick={setGas}>
              <div className="col">
                <div className="color-black-2 fs14 text-left">Gas Fee</div>
              </div>
              <div className="col-auto fs14 color-black-2">
                  <Worth amount={gasFee} symbol='ETh'/> ≈ {toNumber(gasFee)} ETH
                <WebIcon type="right"/>
              </div>
            </div>
            <Button className="mt20 b-block w-100" size="large" onClick={gotoConfirm} type="primary">
              {token.toLowerCase() === 'eth' ?  intl.get('convert.convert_eth_title') : intl.get('convert.convert_weth_title')}
            </Button>
          </div>
          <div hidden className='mt20'>w
            <a onClick={setMax}>{intl.get('convert.actions_max')}</a>
          </div>
          <div hidden className="bg-grey-100 mt15">
            <ConvertHelperOfBalance />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    balance: state.sockets.balance,
    prices: state.sockets.marketcap.items,
    amount: state.convert.amount,
    gas:state.gas
  }
}

export default connect(mapStateToProps)(Convert)






