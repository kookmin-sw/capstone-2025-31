import streamlit as st
import time
from response import generate_response
from session_manager import init_session_state
from sidebar import display_sidebar
from chat_ui import display_chat_messages
from file_handler import handle_file_upload
from similarity import show_detail

# CSS 파일 적용
with open("style.css", encoding='utf-8') as f:
    css = f.read()
    st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)

# 세션 상태 초기화
init_session_state()

# 사이드바 표시
display_sidebar()

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
display_chat_messages()

# 사용자 입력 받기
user_input = st.chat_input("질문을 입력하거나 파일을 업로드하세요:", accept_file='multiple')

# 파일 업로드 처리
if user_input and user_input.files:
    handle_file_upload(user_input.files)

# 텍스트 입력 처리
elif user_input and user_input.text:
    with st.spinner("답변 생성 중..."):
        time.sleep(1)
        response = generate_response(user_input.text)
        st.session_state['chats'][st.session_state['current_chat']].append((user_input.text, response))
        st.rerun()