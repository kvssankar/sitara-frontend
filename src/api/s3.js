import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/rag`;

export const getPresignedUrl = async (fileName, fileType) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  try {
    const response = await axios.post(
      `${BASE_URL}/get-presigned-url`,
      {
        fileName,
        fileType,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting pre-signed URL", error);
    return null;
  }
};

export const processFile = async (fileName, fileType) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  try {
    const response = await axios.post(
      `${BASE_URL}/process-file`,
      {
        fileName,
        fileType,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error processing file", error);
    return null;
  }
};
