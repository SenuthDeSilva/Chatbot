import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "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";
const systemMessage = { "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience." };

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  async function processMessageToChatGPT(chatMessages) {
    try {
      let apiMessages = chatMessages.map((messageObject) => {
        let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
        return { role, content: messageObject.message };
      });

      const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [systemMessage, ...apiMessages]
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Response from ChatGPT:", data);

      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error processing message to ChatGPT:", error);
      throw error;
    }
  }

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    setIsTyping(true);
    
    try {
      await processMessageToChatGPT(newMessages);
    } catch (error) {
      console.error("Error sending message to ChatGPT:", error);
      setIsTyping(false);
      // Handle the error appropriately, such as showing a message to the user or retrying the request.
    }
  };

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App;
