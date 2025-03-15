import streamlit as st
import uuid
from response import generate_response
from similarity import show_detail

def display_chat_messages():
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
        last_query, last_reply = messages[-1]

        if st.button("🔄 답변 재생성", key=f"regen_{st.session_state['current_chat']}_last"):
            with st.spinner("답변 생성 중..."):
                new_response = generate_response(last_query)
                messages[-1] = (last_query, new_response)
                st.session_state['chats'][st.session_state['current_chat']] = messages
                st.rerun()
