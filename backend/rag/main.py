import os
import streamlit as st
from langchain.prompts import ChatPromptTemplate
from langchain_unstructured import UnstructuredLoader
from langchain.embeddings import CacheBackedEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema.runnable import RunnablePassthrough
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain.storage import LocalFileStore
from langchain.schema import ChatMessage
from langserve import RemoteRunnable
from langchain import hub

# 실행하면 처음 뜨는 페이지 타이틀
st.set_page_config(page_title="Ollama Local 모델 테스트", page_icon="💬")
st.title("Ollama local 모델")

# 시작하면서 chatbot이 "무엇을 도와드릴까요?"라며 채팅을 띄웁니다
if "messages" not in st.session_state:
    st.session_state["messages"] = [
        ChatMessage(role="assistant", content="무엇을 도와드릴까요?")
    ]


# 지금까지 주고받은 모든 메시지를 Streamlit 채팅 UI에 출력하는 코드
def print_history():
    for msg in st.session_state.messages:
        st.chat_message(msg.role).write(msg.content)


# 새로운 메시지를 채팅 기록(session_state)에 추가하는 함수
def add_history(role, content):
    st.session_state.messages.append(ChatMessage(role=role, content=content))

 
# 검색한 문서 결과를 하나의 문단으로 합쳐줍니다
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


# 파일을 올리면 Embedding file...이라 뜹니다
@st.cache_resource(show_spinner="Embedding file...")


# 올린 파일을 임베딩하는 코드
def embed_file(file):
    file_content = file.read()

    # 파일 저장 경로 설정
    file_path = f"./.cache/files/{file.name}"
    
    # 읽은 파일을 임시 캐시에 저장
    with open(file_path, "wb") as f:
        f.write(file_content)

    # 임배딩 캐시를 저장할 디렉토리 설정
    cache_dir = LocalFileStore(f"./.cache/embeddings/{file.name}")

    # 텍스트 분할기 설정 : 문서를 작은 청크로 나눕니다
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", "(?<=\.)", " ", ""],
        length_function=len,
    )

    # pdf, docx, txt 파일 로더
    loader = UnstructuredLoader(file_path)

    # 문서를 분할하여 docs 리스트로 만듭니다
    docs = loader.load_and_split(text_splitter=text_splitter)

    # Sbert 임베딩 모델 지정
    model_name = "jhgan/ko-sbert-sts"
    embeddings = HuggingFaceEmbeddings(model_name=model_name)
    
    # 임베딩 객체 생성 (속도를 향상시키기 위함입니다)
    cached_embeddings = CacheBackedEmbeddings.from_bytes_store(embeddings, cache_dir)

    # 문서 리스트를 벡터화 한 후에 FAISS 벡터 DB에 저장합니다
    vectorstore = FAISS.from_documents(docs, cached_embeddings)
    
    # 검색기 형태로 반환하여 RAG 기능을 수행합니다
    retriever = vectorstore.as_retriever()
    return retriever

with st.sidebar:
    file = st.file_uploader(
        "파일 업로드", 
        type=["pdf", "txt", "docx"],
        )

# 파일을 올렸을 경우 retriever를 만들어 RAG 기능을 구현합니다
if file:
    retriever = embed_file(file)

print_history()

# 사용자가 채팅을 입력했다면
if user_input := st.chat_input():

    # 1. 입력한 내용을 세션에 저장합니다
    add_history("user", user_input)

    # 2. 화면에 사용자 메세지를 출력합니다
    st.chat_message("user").write(user_input)

    # 3. chatbot의 응답 시작
    with st.chat_message("assistant"):

        # 로컬에서 돌리는 Ollama Langserver에 연결
        ollama = RemoteRunnable("http://localhost:8000/chat")

        with st.spinner("답변을 생각하는 중입니다..."):
            if file is not None:
                # Langchain이 제공하는 rag용 prompt -> 이건 chat.py에 rag용 prompt를 직접 만들까 고민중...
                prompt = hub.pull("rlm/rag-prompt")

                # Rag 체인 정의
                rag_chain = (
                    {
                        "context": retriever | format_docs,  # 문석 검색 + 텍스트 포맷
                        "question": RunnablePassthrough()    # 질문 원본 전달
                    }
                    | prompt    # Rag prompt를
                    | ollama    # ollama 모델에 전달
                    | StrOutputParser() # 모델 응답을 문자열로 parsing
                )

                # 문서에 대한 질의를 입력하고, 답변을 출력하빈다.
                answer = rag_chain.invoke(
                    user_input
                )

                add_history("ai", answer)
            else:
                # rag 안 썼을 경우(문서 없을 경우)
                
                prompt = ChatPromptTemplate.from_template(
                    "다음의 질문에 간결하게 답변해주세요:\n{input}"
                )

                # 체인 생성
                chain = prompt | ollama | StrOutputParser()

                answer = chain.invoke(user_input)
                add_history("ai", answer)
        
        # 답변 출력
        st.write(answer)