import streamlit as st

@st.dialog("유사도 비교")
def show_detail(message):
    st.write(message)
    if st.button('ok'):
        st.rerun()
