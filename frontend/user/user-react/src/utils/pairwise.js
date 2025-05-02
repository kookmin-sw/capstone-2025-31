import axios from 'axios';

export const sendPairwiseCheck = async (queryText) => {
  try {
    const response = await axios.post("http://192.168.0.21:8000/pairwise-check", {
      query_text: queryText,
    });
    return response.data.result_file;  // 결과 csv 경로 반환
  } catch (error) {
    console.error("Pairwise Check 요청 실패:", error);
    return null;
  }
};
