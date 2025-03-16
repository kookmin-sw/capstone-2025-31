import streamlit as st
from datetime import datetime

def display_sidebar():
    with st.sidebar:
        if st.button("새 대화 시작"):
            st.session_state['chat_count'] += 1
            new_chat_name = f"{datetime.now().strftime('%Y.%m.%d')} 대화{st.session_state['chat_count']}"
            st.session_state['current_chat'] = new_chat_name
            st.session_state['chats'][new_chat_name] = []
            st.session_state['chat_dates'][new_chat_name] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # 새 대화 날짜 기록

        previous_chats = list(st.session_state['chats'].keys())
        st.subheader("이전 대화")
        for chat_name in previous_chats:
            if st.button(chat_name, key=chat_name):
                st.session_state['current_chat'] = chat_name
