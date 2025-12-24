// AI Service - DISABLED as per user request
// This file is now a stub to prevent any AI model loading.

export const verifyProof = async (file) => {
  console.log("AI Verification passed (Stubbed).");
  return { verified: true, reason: "Manual bypass" };
};

export const uploadProof = async (file) => {
  // Basic stub if needed, but we do manual upload in App.jsx mostly now.
  // However, if called, just return a fake URL or handle it.
  console.log("Upload Proof Stub called");
  return "https://via.placeholder.com/300?text=Proof+Submitted";
};
