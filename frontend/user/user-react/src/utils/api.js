import axios from "axios";

export const sendMessage = async (messages) => {
  try {
    const response = await axios.post("http://192.168.0.21:8000/chat", {
      messages,
    });
    return response.data.response; 
  } catch (error) {
    console.error("요청 실패:", error);
    return "서버 요청 중 오류가 발생했습니ek.";
  }
};
