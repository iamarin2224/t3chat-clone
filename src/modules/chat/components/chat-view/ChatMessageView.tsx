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
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <ChatWelcomeTabs
                username={user?.name}
                onMessageSelect={handleMessageSelect}
            />
        </div>

        <ChatMessageForm
            initialMessage={selectedMessage}
            onMessageChange={handleMessageChange}
        />
    </div>
  )
}

export default ChatMessageView