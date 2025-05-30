import React from 'react'
import { Text } from '@botonic/react'
import { humanHandOff } from '@botonic/core'

export default class extends React.Component {
  static async botonicInit({ session }) {
    await humanHandOff(session, 'HUBTYPE_DESK_QUEUE_ID', {
      payload: 'end',
    })
  }
  render() {
    return (
      <Text>You will be transferred to a human to solve your issues.</Text>
    )
  }
}