import React, { useRef, useState, useEffect, createContext, useContext } from "react"
import { v4 as uuid } from 'uuid'
import { useFetch } from "../hooks"
import { useAppContext } from "./appContext"
import { useUserContext } from "./userContext"
import { formatMessagesAndSetConversations } from './helpers/formatMessagesAndSetConversations'
import { 
    IIncomingMessage,
    IConversation,
    IMessagesContext,
    IMessagesChannelsKeys
 } from '../utils/interfaces'

const MessagesContext = createContext(null)

export const useMessagesContext = (): IMessagesContext => useContext(MessagesContext)

interface IProps {
    children: React.ReactNode
}

export const MessagesContextProvider: React.FC<IProps> = ({ children }) => {
    //* hooks & context
    const { getUserMessages } = useFetch()
    const { envRef, setFlashMessage } = useAppContext()
    const { user, tokenInStorage: token } = useUserContext()

    //* state
    // set conversations from fetched messages
    const [conversations, setConversations] = useState<IConversation[] | undefined>(undefined)
    const notificationConversationKeyRef = useRef<IIncomingMessage | undefined>(undefined)

    //* state
    // websocket
    const [ws, setWs] = useState(undefined)
    const [guid, setGuid] = useState<number>(uuid())
    const [messagesChannelsKeys, setMessagesChannelsKeys] = useState<IMessagesChannelsKeys | undefined>(undefined)

    // fetch user messages (as author or recipient)
    useEffect(() => {
        if(typeof token !== 'string' || token === '{}') return
        
        (async () => {
            const fetchedData = await getUserMessages()
            if(!fetchedData) return

            const [response, data] = fetchedData
            if(!response.ok || !data?.messages) return
        
            const fetchedMessages = data?.messages

            const conversations = formatMessagesAndSetConversations(fetchedMessages)
            setConversations(conversations)
        })()
    }, [token])

    // set (websocket) messagesChannelsKeys
    useEffect(() => {
        if (!conversations) return
    
        const channelKeys = Object.keys(conversations)
        setMessagesChannelsKeys(channelKeys)
    }, [conversations])

    // set websocket
    useEffect(() => {
        if(typeof token !== 'string' || token === '{}') return
        if(!user?.userId || !messagesChannelsKeys) return

        const wsURL = envRef?.current === "production" ?
            `wss://swapbnb.onrender.com/cable?token=${encodeURIComponent(token)}`
            : `ws://localhost:3000/cable?token=${encodeURIComponent(token)}`


        console.log("wsURL", wsURL)

        const ws = new WebSocket(wsURL)

        // subscribe to all MessagesChannels
        ws.onopen = () => {
            console.log("connected to websocket")

            messagesChannelsKeys.forEach((channelKey) => {
            ws.send(
                JSON.stringify({
                command: "subscribe",
                identifier: JSON.stringify({
                    id: guid,
                    channel: "MessagesChannel",
                    channelKey: channelKey,
                })})
            )})
        }

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if(data.type === "ping") return
            if(data.type === "welcome") return
            if(data.type === "confirm_subscription") return
            
            const inComingMessage: IIncomingMessage =  data?.message?.message
            if(!inComingMessage) return
            
            const inComingConversation: IConversation = formatMessagesAndSetConversations([inComingMessage])
            const inComingConversationKey = Object.keys(inComingConversation)[0]
            const inComingConversationValue = inComingConversation[inComingConversationKey]

            // set notification if user is recipient
            if(user?.userId === inComingMessage?.recipient?.userId) {
                notificationConversationKeyRef.current = inComingMessage
            }

            const newConversations = Object.keys(conversations).reduce((acc, key) => {
                return key === inComingConversationKey ?
                { ...acc, [key]: [ ...conversations[key], ...inComingConversationValue] }
                : { ...acc, [key]: conversations[key] }
            }, {})
            
            // set conversations
            setConversations(newConversations)
        }
        
        // return () => {
        //     console.log('===========')
        //     console.log('MessagesContextProvider useEffect  ws.onclose')
        //     ws.close()
        // }

        setWs(ws)
    }, [user, token, messagesChannelsKeys])

    useEffect(() => {
        if(!user?.userId) return
        if(!notificationConversationKeyRef.current?.author) return

        const { author: { email: authorEmail } } = notificationConversationKeyRef.current

        const authorName = authorEmail.split("@")[0]
        const notificationMessage = `New message from ${authorName}`

        setFlashMessage({ message: notificationMessage, type: "success"})
    }, [user, notificationConversationKeyRef.current])

    
    return (
        <MessagesContext.Provider value={{
            notificationConversationKeyRef,
            conversations,
            setConversations,
        }}>
            { children }
        </MessagesContext.Provider>
    )
}
