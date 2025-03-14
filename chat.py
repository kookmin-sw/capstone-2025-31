from langchain_community.chat_models import ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

llm = ChatOllama(model="EEVE-Korean-10.8B:latest")

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a helpful AI Assistant. Your name is 'chatbot'. You must answer in Korean. 
            Always provide answers that match the user's question. When asked about the documen. 
            base your response on its content rather than your own thoughts. Do not create questions; only provide answers.""",
        ),
        MessagesPlaceholder(variable_name="messages")
    ]

)

chain = prompt | llm | StrOutputParser()