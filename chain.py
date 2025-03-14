# from langchain_community.chat_models import ChatOllama
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# Langchain이 지원하는 다른 채팅 모델을 사용
llm = ChatOllama(model="EEVE-Korean-10.8B:latest")

prompt = ChatPromptTemplate.from_template("{topic} 에 대하여 간략히 설명해줘.")

# LangChain 표현식 언어 체인 구문을 사용
chain = prompt | llm | StrOutputParser()