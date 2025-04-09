import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import datetime
import os

# "upload_files" 폴더가 없으면 생성
if not os.path.exists("upload_files"):
    os.makedirs("upload_files")

st.set_page_config(layout="wide", page_title="관리자 페이지")
st.markdown(
    """
    <style>
        .block-container {
            padding: 2rem;
        }
        .section {
            border: 1px solid #ddd;
            border-radius: 10px;
        }
        .title {
            font-size: 25px;
            font-weight: bold;
        }
        .detail {
            font-size: 18px;
            font-weight: bold;
        }
        .content {
            font-size: 16px;
            text-align: center;
        }
        .stApp {
            background-color: #ffffff;
        }
        .delete-button {
            background-color: red;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        .card {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            border-left: 5px solid #007BFF;
        }
        .card:hover {
            background-color: #e6f2ff;
        }
        .card a {
            text-decoration: none;
            font-weight: bold;
            color: #007BFF;
        }
    </style>
    """,
    unsafe_allow_html=True
)

# upload_files 폴더에 있는 파일 목록 불러오기
def load_documents_from_folder(folder_path="upload_files"):
    file_list = os.listdir(folder_path)
    documents = []
    for file_name in file_list:
        documents.append({
            "name": file_name,
            "status": "green",
            "favorite": False
        })
    return documents

if "documents" not in st.session_state:
    st.session_state.documents = load_documents_from_folder("upload_files")

# 즐겨찾기 토글
def toggle_favorite(doc_name):
    for doc in st.session_state.documents:
        if doc["name"] == doc_name:
            doc["favorite"] = not doc["favorite"]

# 문서 선택
def select_document(doc_name):
    st.session_state.selected_document = doc_name

# 기업 문서 관리
st.sidebar.markdown("# 기업 문서 관리")
st.markdown("</div>", unsafe_allow_html=True)


# 파일 업로드
uploaded_file = st.sidebar.file_uploader("문서 업로드", type=["pdf", "docx", "txt"])
if uploaded_file is not None:
    file_path = os.path.join("upload_files", uploaded_file.name)
    # 동일 파일 덮어쓰기기 (필요 없을 시 if-check 제거)
    if not os.path.exists(file_path):
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
            
        st.session_state.documents.append({
            "name": uploaded_file.name,
            "status": "green",
            "favorite": False
        })
        st.success(f"'{uploaded_file.name}' 업로드가 완료되었습니다!")

st.sidebar.markdown("---")

# 문서 목록 정렬 및 검색색
search_query = st.sidebar.text_input("문서 검색")
documents = sorted(st.session_state.documents, key=lambda x: x['favorite'], reverse=True)
filtered_documents = [doc for doc in documents if search_query.lower() in doc['name'].lower()]

# 사이드바에 문서 목록 표시
max_length = 12
for doc in filtered_documents:
    star = "⭐" if doc['favorite'] else "☆"
    status_color = "🟢" if doc['status'] == 'green' else "🔴" if doc['status'] == 'red' else "🟠"
    
    title = doc['name']
    if len(title) > max_length:
        title = title[:max_length] + "..."
    
    col_fav, col_title, col_status = st.sidebar.columns([1, 5, 1])
    
    # 버튼 클릭 시 문서 상태 변경 (Streamlit은 버튼 클릭 시 전체 코드 재실행)
    if col_fav.button(star, key=f"fav_{doc['name']}"):
        toggle_favorite(doc['name'])
    if col_title.button(title, key=f"select_{doc['name']}"):
        select_document(doc['name'])
    
    col_status.markdown(f"<div style='text-align: right; padding-top: 6px;'>{status_color}</div>", unsafe_allow_html=True)

# 탐지 통계 및 오늘 탐지된 횟수
col_left, col_space, col_right = st.columns([1, 0.05, 1])

# 왼쪽 컬럼(일자별 탐지 통계)
with col_left:
    st.markdown("<div class='section'>", unsafe_allow_html=True)
    st.markdown("<div class='title'>일자별 탐지 통계</div>", unsafe_allow_html=True)
    col3, col4 = st.columns(2)
    with col3:
        start_date = st.date_input("시작 날짜", datetime.date(2025, 1, 1))
    with col4:
        end_date = st.date_input("종료 날짜", datetime.date(2025, 12, 31))
    
    dates = pd.date_range(start=start_date, end=end_date, freq='7D')
    values = [40, 8, 60, 55, 70, 30, 19] * (len(dates) // 7 + 1)
    values = values[:len(dates)]
    
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(dates, values, marker='o', linestyle='-', color='black')
    st.pyplot(fig)

with col_space:
    st.markdown("<div style='border-left: 2px solid #ddd; height: 55vh;'></div>", unsafe_allow_html=True)

# 오른쪽 컬럼(오늘 탐지된 횟수)  
with col_right:
    st.markdown("<div class='section'>", unsafe_allow_html=True)
    st.markdown("<div class='title'>오늘 탐지된 횟수</div>", unsafe_allow_html=True)

    today_detected = 5
    st.markdown(f"<h1 style='color:red; text-align:center;'>{today_detected}회 검색 탐지</h1>", unsafe_allow_html=True)
    current_date = datetime.date.today().strftime("%Y년 %m월 %d일")
    st.markdown(f"<h4 style='text-align:center;'>{current_date}</h4>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    
    data = {
        "시간": ["12:00", "13:00", "16:00", "19:00", "21:00"],
        "문서 명": ["문서 1", "문서 2", "문서 5", "문서 9", "문서 6"] 
    }
    df = pd.DataFrame(data)
    st.table(df)

st.markdown("<div class='section'>", unsafe_allow_html=True)
col_top, col_top_btn = st.columns([8, 1])

with col_top:
    st.markdown("<div class='title'>문서 상세 사항</div>", unsafe_allow_html=True)
    selected_doc = st.session_state.get("selected_document", "문서를 선택하세요")
    st.markdown(f"#### 📜 {selected_doc}", unsafe_allow_html=True)

# 문서 삭제 버튼
with col_top_btn:
    st.markdown("<div style='text-align: right;'>", unsafe_allow_html=True)
    if st.button("문서 삭제"):
        selected_doc = st.session_state.get("selected_document", None)
        if selected_doc and selected_doc != "문서를 선택하세요":
            file_path = os.path.join("upload_files", selected_doc)
            if os.path.exists(file_path):
                os.remove(file_path)
                st.session_state.documents = [
                    doc for doc in st.session_state.documents if doc["name"] != selected_doc
                ]
                st.session_state.selected_document = "문서를 선택하세요"
                st.success(f"문서 '{selected_doc}'가 삭제되었습니다.")
            else:
                st.warning(f"문서 '{selected_doc}'는 이미 존재하지 않습니다.")
        else:
            st.warning("삭제할 문서를 선택하세요.")
    st.markdown("</div>", unsafe_allow_html=True)

# 문서 상세 사항
st.markdown("</div>", unsafe_allow_html=True)
col_regdate, col_space1, col_detectcount, col_space2, col_similarity, col_space3, col_uploadstatus = st.columns(
    [1, 0.05, 1, 0.05, 1, 0.05, 1]
)

with col_regdate:
    st.markdown("<span class='detail'>등록 일자</span>", unsafe_allow_html=True)
    st.markdown("<div class='content'>2025년 5월 3일</div>", unsafe_allow_html=True)

with col_space1:
    st.markdown("<div style='border-left: 2px solid #ddd; height: 10vh;'></div>", unsafe_allow_html=True)

with col_detectcount:
    st.markdown("<span class='detail'>탐지 횟수</span>", unsafe_allow_html=True)
    st.write("<div class='content'>3 회 (세부 날짜)</div>", unsafe_allow_html=True)

with col_space2:
    st.markdown("<div style='border-left: 2px solid #ddd; height: 10vh;'></div>", unsafe_allow_html=True)

with col_similarity:
    st.markdown("<span class='detail'>최대유사도</span>", unsafe_allow_html=True)
    st.write("<div class='content'>60% (세부 날짜)</div>", unsafe_allow_html=True)

with col_space3:
    st.markdown("<div style='border-left: 2px solid #ddd; height: 10vh;'></div>", unsafe_allow_html=True)

with col_uploadstatus:
    st.markdown("<span class='detail'>업로드 상태</span>", unsafe_allow_html=True)
    st.write("<div class='content'>업로드 중</div>", unsafe_allow_html=True)

st.markdown("<div class='section'>", unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)

# 탐지 세부 사항
detection_data = [
    {"날짜": "2025년 6월 20일", "탐지 내용": "탐지 내용", "세부 사항": "해당 문서가 85% 유사"},
    {"날짜": "2025년 6월 25일", "탐지 내용": "탐지 내용", "세부 사항": "해당 문서가 70% 유사"},
    {"날짜": "2025년 7월 2일", "탐지 내용": "탐지 내용", "세부 사항": "해당 문서가 90% 유사"},
    {"날짜": "2025년 7월 10일", "탐지 내용": "탐지 내용", "세부 사항": "해당 문서가 100% 유사"},
]

if "selected_idx" not in st.session_state:
    st.session_state.select_idx = None

st.markdown("<div class='title'>탐지 세부 사항</div>", unsafe_allow_html=True)
st.markdown("아래 항목을 클릭하면 해당 세부 사항이 표시됩니다. 다시 클릭하면 숨깁니다.")
st.markdown("</div>", unsafe_allow_html=True)

for idx, detection in enumerate(detection_data):
    key = f"detection_{idx}"
    if st.button(f"{detection['날짜']}   |   {detection['탐지 내용']}", key=key):
        if st.session_state.select_idx == idx:
            st.session_state.select_idx = None
        else:
            st.session_state.select_idx = idx

    if st.session_state.select_idx == idx:
        st.markdown(f"**날짜:** {detection['날짜']}")
        st.markdown(f"**탐지 내용:** {detection['탐지 내용']}")
        st.markdown(f"**세부 사항:** {detection['세부 사항']}")
