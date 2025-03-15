import streamlit as st
import time
import uuid

# CSS 파일 적용
with open("style.css", encoding='utf-8') as f:
    css = f.read()
    st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)

def generate_response(user_input):
    return f"{user_input}"  # 그대로 출력

#유사도 비교 정보를 보여줄 화면
@st.dialog("유사도 비교 결과")
def show_detail(message):
    st.write(message)
    if st.button('ok'):
        st.rerun()

# 세션 상태 초기화
if 'chats' not in st.session_state:
    st.session_state['chats'] = {} # 대화를 저장하는 딕셔너리
    st.session_state['chat_count'] = 1 # 대화 번호
    st.session_state['current_chat'] = "대화1" # 현재 대화 이름 저장

# 대화1 생성
if st.session_state['current_chat'] not in st.session_state['chats']:
    st.session_state['chats'][st.session_state['current_chat']] = []

# 사이드바
with st.sidebar:
    if st.button("새 대화 시작"):
        st.session_state['chat_count'] += 1
        new_chat_name = f"대화{st.session_state['chat_count']}"
        st.session_state['current_chat'] = new_chat_name
        st.session_state['chats'][new_chat_name] = []
        st.rerun()

    previous_chats = list(st.session_state['chats'].keys())
    st.subheader("이전 대화")
    for chat_name in previous_chats:
        if st.button(chat_name, key=chat_name):
            st.session_state['current_chat'] = chat_name
            st.rerun()

# 메인 화면
st.title("Streamlit Chatbot")

if not st.session_state['chats'][st.session_state['current_chat']]:
    st.markdown("""
        ### 환영합니다!
        - 이 챗봇은 생성형 AI를 활용하여 질문에 답변합니다.
        - 사이드바에서 파일을 업로드하거나, 이전 대화를 불러올 수 있습니다.
        - 질문을 입력하면 AI가 답변해줍니다. 😊
    """)

# 채팅 메시지 출력
messages = st.session_state['chats'][st.session_state['current_chat']]
for i, (query, reply) in enumerate(messages):
    unique_key = str(uuid.uuid4())  # 각 메시지마다 고유한 UUID 생성

    # 사용자 질문
    st.markdown(f"<div class='chat-container'><div class='user-message'>{query}</div></div>", unsafe_allow_html=True)

    # AI 답변
    st.markdown(f"<div class='chat-container'><div class='ai-message'>{reply}</div></div>", unsafe_allow_html=True)

    if st.button(f"📄 유사도 비교 정보", key=f"dialog_{i}"):
        show_detail("유사도 비교 정보~~~")

# 마지막 메시지에만 답변 재생성 버튼 생성
if len(messages) > 0:
    last_query, last_reply = messages[-1]  # 마지막 질문과 답변

    # 답변 재생성 버튼
    if st.button("🔄 답변 재생성", key=f"regen_{st.session_state['current_chat']}_last"):
        with st.spinner("답변 생성 중..."):
            new_response = generate_response(last_query)
            messages[-1] = (last_query, new_response)  # 마지막 메시지에 대해 새로운 답변을 설정
            st.session_state['chats'][st.session_state['current_chat']] = messages
            st.rerun()

# 사용자 입력 받기
user_input = st.chat_input("질문을 입력하거나 파일을 업로드하세요:", accept_file='multiple')

# 파일이 업로드된 경우
if user_input and user_input.files:
    for uploaded_file in user_input.files:
        file_content = uploaded_file.read().decode("utf-8")  # 파일을 문자열로 변환
        response = generate_response(file_content)
        messages.append((f"📂 {uploaded_file.name}", response))  # 파일명과 응답 저장
    st.session_state['chats'][st.session_state['current_chat']] = messages
    st.rerun()

# 텍스트 입력이 있는 경우
elif user_input and user_input.text:
    with st.spinner("답변 생성 중..."):
        time.sleep(1)
        response = generate_response(user_input.text)
        messages.append((user_input.text, response))
        st.session_state['chats'][st.session_state['current_chat']] = messages
        st.rerun()