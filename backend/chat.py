from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# LLM 모델 설정
llm = ChatOllama(model="exaone-3.5-7.8b-instruct:latest")

# Chatbot의 시스템 메시지 설정
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """당신은 유용한 AI 어시스턴트입니다. 당신의 이름은 'chatbot'입니다. 반드시 한국어로만 답변해야 합니다. 
            질문과 무관한 민감하거나 기밀로 간주될 수 있는 문서 내용을 절대 임의로 노출해서는 안 됩니다.
            """,
        ),
        MessagesPlaceholder(variable_name="messages")
    ]
)

# Chain : 여러 처리 단계를 연결하여 하나의 흐름으로 만드는 구조.
# 프롬프트 -> LLM -> 출력
chain = prompt | llm | StrOutputParser()