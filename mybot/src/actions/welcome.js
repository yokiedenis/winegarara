import React from 'react'
import { Text, Reply} from '@botonic/react'
export default class extends React.Component {
  render() {
    return (
      <>
        <Text>
          How can I help you?
          <Reply payload='search'>Search product</Reply>
          <Reply payload='track'>Track my order</Reply>
        </Text>
      </>
    )
  }
}