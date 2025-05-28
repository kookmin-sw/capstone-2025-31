import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/admin";

// 문서 목록 조회 (검색 포함)
export const fetchFileList = async (searchQuery = "") => {
  const response = await axios.get(`${BASE_URL}/files`, {
    params: { query: searchQuery },
  });
  return response.data;
};

// 문서 상세 조회
export const fetchFileDetail = async (fileId) => {
  const response = await axios.get(`${BASE_URL}/files/${fileId}`);
  return response.data;
};

//  문서 업로드
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${BASE_URL}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 업로드 가능 상태 조회
export const checkIOInterrupt = async () => {
  const response = await axios.get(`${BASE_URL}/IOinterrupt`);
  return response.data;
};

// 문서 삭제
export const deleteFile = async (fileId) => {
  const response = await axios.delete(`${BASE_URL}/files/${fileId}`);
  return response.data;
};

// 대시보드용 통계
export const fetchStatistics = async () => {
  const response = await axios.get(`${BASE_URL}/statistics`);
  return response.data;
};

// 대시보드용 실시간 탐지 현황
export const fetchLiveDetections = async () => {
  const response = await axios.get(`${BASE_URL}/live`);
  return response.data;
};

export const fetchDetectionList = async () => {
  const response = await axios.get(`${BASE_URL}/detail`);
  return response.data;
};

export const fetchDetectionDetail = async (id) => {
  const response = await axios.get(`${BASE_URL}/detail/${id}`);
  return response.data;
};