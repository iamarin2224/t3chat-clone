"use client";

import React , {useState} from "react";
import ChatWelcomeTabs from "./ChatWelcomeTabs";
import ChatMessageForm from "./ChatMessageForm";

import { UserData } from "../../../authentication/components/user-button";


const ChatMessageView = ({user}:{user:UserData}) => {

    const [selectedMessage , setSelectedMessage] = useState("")

    const handleMessageSelect = (messsage:string)=>{
        setSelectedMessage(messsage)
    }

    const handleMessageChange = ()=>{
        setSelectedMessage("")
    }


  return (
    <div className="relative flex flex-col h-screen w-full pt-10 pb-6">
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <ChatWelcomeTabs
                username={user?.name}
                onMessageSelect={handleMessageSelect}
            />
        </div>

        <div className="w-full shrink-0">
            <ChatMessageForm
                initialMessage={selectedMessage}
                onMessageChange={handleMessageChange}
            />
        </div>
    </div>
  )
}

export default ChatMessageView