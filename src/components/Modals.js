import React from 'react'
import Containers from 'modules/containers'
import UiContainers from 'LoopringUI/containers'
import HelperOfGas from './HelperOfGas'

function Modals(props) {
  return (
    <div>
      <Containers.Layers id="helperOfGas">
        <UiContainers.Popups id="helperOfGas">
          <HelperOfGas />
        </UiContainers.Popups>
      </Containers.Layers>
    </div>
  )
}
export default Modals
