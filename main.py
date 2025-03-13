import os
import streamlit as st
from langchain.prompts import ChatPromptTemplate
from langchain.document_loaders import UnstructuredFileLoader
from langchain.embeddings import HuggingFaceEmbeddings 
from langchain.schema.runnable import RunnablePassthrough
from langchain.storage import LocalFileStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores.faiss import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import ChatMessage
from langserve import RemoteRunnable
from sentence_transformers import SentenceTransformer


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
def embed_file(file):
    file_content = file.read()
    
    file_dir = "./.cache/files/"
    file_path = os.path.join(file_dir, file.name)

    embedding_dir = "./.cache/embeddings/"

    os.makedirs(file_dir, exist_ok=True)
    os.makedirs(embedding_dir, exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(file_content)

    cache_dir = LocalFileStore(os.path.join(embedding_dir, file.name))

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", "(?<=\.)", " ", ""],
        length_function=len,
    )

    loader = UnstructuredFileLoader(file_path)
    docs = loader.load_and_split(text_splitter=text_splitter)


    model_path = "C:/Users/seclab/Dev/Langchain-ollama/model/ko-sbert-sts"

    if os.path.exists(model_path):
        print(f"✅ 경로가 존재합니다: {model_path}")

        try:
            embeddings = HuggingFaceEmbeddings(model_name=model_path)
            embedding_model = SentenceTransformer(model_path)
        
            test_sentence = "안녕하세요, 테스트 문장입니다."
            test_vector = embedding_model.encode(test_sentence)  

            print("✅ 모델이 정상적으로 로드되었습니다.")
            print(f"🔹 테스트 문장 임베딩 벡터 크기: {test_vector.shape}")

        except Exception as e:
            print("❌ 모델 로드 중 오류 발생!")
            print(e)
    else:
        print(f"❌ 모델 경로를 찾을 수 없습니다: {model_path}")


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
                    prompt = ChatPromptTemplate.from_template(
                        "다음 문맥을 기반으로 질문에 답변하세요:\n\n{context}\n\n질문: {question}"
                    )
                    rag_chain = (
                        {
                            "context": retriever | (lambda docs: "\n\n".join(doc.page_content for doc in docs)),
                            "question": RunnablePassthrough(),
                        }
                        | prompt
                        | ollama
                        | StrOutputParser()
                    )
                    answer = rag_chain.invoke(user_input)
                else:
                    prompt = ChatPromptTemplate.from_template("다음의 질문에 간결하게 답변해주세요:\n{input}")
                    chain = prompt | ollama | StrOutputParser()
                    answer = chain.invoke(user_input)

                add_history("ai", answer)
                st.write(answer)
            except Exception as e:
                st.error(f"응답 생성 중 오류 발생: {str(e)}")