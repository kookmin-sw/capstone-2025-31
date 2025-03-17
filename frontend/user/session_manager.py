import streamlit as st
from datetime import datetime

def init_session_state():
    if 'chats' not in st.session_state:
        st.session_state['chats'] = {}  # 대화를 저장하는 딕셔너리
        st.session_state['chat_count'] = 1  # 대화 번호
        st.session_state['current_chat'] = f"{datetime.now().strftime('%Y.%m.%d')} 대화1"  # 현재 대화 이름 저장
        st.session_state['chat_dates'] = {}  # 대화 날짜 저장

    # 대화1 생성
    if st.session_state['current_chat'] not in st.session_state['chats']:
        st.session_state['chats'][st.session_state['current_chat']] = []
        st.session_state['chat_dates'][st.session_state['current_chat']] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
