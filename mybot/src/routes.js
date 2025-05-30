import React from 'react'
import Welcome from './actions/welcome'
import track from './actions/track'
import search from './actions/search'
import FinalAction from './actions/final-action'
import returnAction from './actions/return'

const returnProductsRegex =
  /(^|\s)(return|refund|exchange|bring back|send back|wrong item|not what (i|I) ordered|faulty|broken|damaged|defective|not working|change (item|product)|(i|I) want (a|my) (refund|return)|(i|I) don't want this|(i|I) need (a|my) (refund|return)|(i|I) received (wrong|bad|damaged)|(i|I) want to return|(i|I) want to exchange|(i|I) want my money back|(i|I) want replacement|(i|I) want another one|return policy|refund policy|how to return|how to refund|bad quality|not good|sizze (small|big)|wrong (size|color|model))([!\?.,]|\s*$)/i;
const goodbyeRegex =
  /(^|\s)(goodbye|bye|bye-bye|farewell|see you|see ya|cya|later|take care|have a good (one|day|night)|cheers|peace out|until next time|go well|webale|weraba|gyebale|tuonane|tulabagane|tulabagane enkya|tulabagane olunaku|bye for now|quit|exit|stop|end|close|finish|done|enough)([!\?.,]|\s*$)/i;
const ugandaGreetingsRegex =
    /(^|\s)(hi|hello|hey|howdy|hola|salama|help|start|oyta|otya|wasuze otya\??|oli otya\??|gyebale ko|webale ko|agandi\??|mirembe|nkulamusizza|nyabo|ssebo|wapwoza\??|wakabaire\??|amakuru\??|habari\??|yammi|yammie|mambo|salaam|salutations|good (morning|afternoon|evening)|greetings?)([!\?.,]|\s*$)/i;
export const routes = [
    {
        path: 'initial',
        text: ugandaGreetingsRegex,
        action: Welcome,


        childRoutes: [
            {
                path: 'track',
                payload: 'track',
                action: track,
            },
            {
                path: 'search',
                payload: 'search',
                action: search,
            },
        ],

    },
    {
        path: "return-action",
        text:returnProductsRegex,
        intent: "return",
        action: returnAction
    },
    {
        path: "end-of-flow",
        text: goodbyeRegex,
        payload: "end",
        action: FinalAction
    }

]