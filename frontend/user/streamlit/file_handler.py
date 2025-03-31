import streamlit as st
from response import generate_response

def handle_file_upload(files):
    messages = st.session_state['chats'][st.session_state['current_chat']]
    
    for uploaded_file in files:
        file_content = uploaded_file.read().decode("utf-8")  # 파일을 문자열로 변환
        response = generate_response(file_content)
        messages.append((f"📂 {uploaded_file.name}", response))  # 파일명과 응답 저장

    st.session_state['chats'][st.session_state['current_chat']] = messages
    st.rerun()
