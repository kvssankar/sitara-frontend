import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/genai`;

export const generateUtterances = async (intent) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("userId"),
    };
    const response = await axios.post(
      `${BASE_URL}/utterances`,
      { intent },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating utterances", error);
    return null;
  }
};
