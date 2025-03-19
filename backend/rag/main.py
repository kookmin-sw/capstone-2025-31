import os
import streamlit as st
from langchain.prompts import ChatPromptTemplate
from langchain_unstructured import UnstructuredLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema.runnable import RunnablePassthrough
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage
from langchain.schema import ChatMessage
from langserve import RemoteRunnable
from chat import chain as chat_chain, rag_prompt

st.set_page_config(page_title="Ollama Local 모델 테스트", page_icon="💬")
st.title("Ollama local 모델")

if "messages" not in st.session_state:
    st.session_state["messages"] = [
        ChatMessage(role="assistant", content="무엇을 도와드릴까요?")
    ]

def print_history():
    for msg in st.session_state.messages:
        st.chat_message(msg.role).write(msg.content)

def add_history(role, content):
    st.session_state.messages.append(ChatMessage(role=role, content=content))

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@st.cache_resource(show_spinner="Embedding file...")

# 올린 파일을 임베딩하는 코드
def embed_file(file):
    file_content = file.read()
    
    # 올린 파일을 저장할 공간(해당 파일에 자동 생성)
    file_dir = "./.cache/files/"
    file_path = os.path.join(file_dir, file.name)

    embedding_dir = "./.cache/embeddings/"

    os.makedirs(file_dir, exist_ok=True)
    os.makedirs(embedding_dir, exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(file_content)

    # 임의로 설정한 split size입니다. 
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", "(?<=\.)", " ", ""],
        length_function=len,
    )

    # pdf 파일 로더
    loader = UnstructuredLoader(file_path)
    docs = loader.load_and_split(text_splitter=text_splitter)


    model_path = "C:/Users/seclab/Dev/Langchain-ollama/model/ko-sbert-sts"
    embeddings = HuggingFaceEmbeddings(model_name=model_path)

    # 다른 분들은 이 코드로 편안히 임베딩 하시면 됩니다
    # model_path = "jhgan/ko-sbert-sts"
    # embeddings = HuggingFaceEmbeddings(model_name=model_path)
    
    vectorstore = FAISS.from_documents(docs, embeddings)
    retriever = vectorstore.as_retriever()
    return retriever

with st.sidebar:
    file = st.file_uploader("파일 업로드", type=["pdf", "txt", "docx"])

if file:
    retriever = embed_file(file)

print_history()

if user_input := st.chat_input():
    add_history("user", user_input)
    st.chat_message("user").write(user_input)

    with st.chat_message("assistant"):
        ollama = RemoteRunnable("http://localhost:8000/chat/")


        with st.spinner("답변을 생각하는 중입니다..."):
            try:
                if file is not None and any(keyword in user_input for keyword in ["파일", "문서", "내용", "설명", "정보"]):
                    rag_chain = (
                        {
                            "context": retriever | (lambda docs: "\n\n".join(doc.page_content for doc in docs)),
                            "question": RunnablePassthrough(),
                        }
                        # chat.py에서 가져온 rag의 prompt
                        | rag_prompt
                        | ollama
                        | StrOutputParser()
                    )
                    answer = rag_chain.invoke(user_input)
                else:
                    # rag기능이 필요 없는 경우엔 chat.py의 기존 프롬프트를 그대로 이용
                    answer = chat_chain.invoke({"messages": [HumanMessage(content=user_input)]})

                add_history("ai", answer)
                st.write(answer)

            except Exception as e:
                st.error(f"응답 생성 중 오류 발생: {str(e)}")