import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/support`;

// Create a new support case
export const createSupportCase = async (caseData) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.post(`${BASE_URL}/cases`, caseData, { headers });
  return response.data;
};

// Get presigned URL for file upload to a support case
export const getSupportCaseUploadUrl = async (caseId, fileName, fileType) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.post(
    `${BASE_URL}/cases/${caseId}/upload-url`,
    { fileName, fileType },
    { headers }
  );
  return response.data;
};

// Add a message to a support case
export const addSupportCaseMessage = async (caseId, messageData) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.post(
    `${BASE_URL}/cases/${caseId}/messages`,
    messageData,
    { headers }
  );
  return response.data;
};

// Get support case details
export const getSupportCase = async (caseId) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.get(`${BASE_URL}/cases/${caseId}`, { headers });
  return response.data;
};

// Get all support cases for current user
export const getSupportCases = async () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.get(`${BASE_URL}/cases`, { headers });
  return response.data;
};

// Update support case
export const updateSupportCase = async (caseId, updateData) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.put(`${BASE_URL}/cases/${caseId}`, updateData, {
    headers,
  });
  return response.data;
};

export const getSupportCaseMessages = async (caseId) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.get(`${BASE_URL}/cases/${caseId}/messages`, {
    headers,
  });
  return response.data;
};

// Get case summary
export const getSupportCaseSummary = async (
  caseId,
  forceRegenerate = false
) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("userId"),
  };
  const response = await axios.get(
    `${BASE_URL}/cases/${caseId}/summary?force=${forceRegenerate}`,
    { headers }
  );
  return response.data;
};
