/**
 * ============================================================================
 * File: aiService.ts
 * Path: Frontend/src/services/aiService.ts
 * ----------------------------------------------------------------------------
 * Purpose:
 * Handles all communication between the Knected frontend and AI backend.
 *
 * Responsibilities:
 * - Generate project summary
 * - Explain dependency relationships
 * - Generate architecture insights
 * - Ask Knected AI questions
 * ============================================================================
 */

const API_BASE_URL = "http://localhost:5000/api/ai";


// ============================================================================
// Types
// ============================================================================

export interface AISummaryResponse {
  success: boolean;
  message: string;
  data: {
    projectId: string;
    summary: string;
  };
}

export interface AIDependencyResponse {
  success: boolean;
  message: string;
  data: {
    projectId: string;
    source: string;
    target: string;
    explanation: string;
  };
}

export interface AIArchitectureResponse {
  success: boolean;
  message: string;
  data: {
    projectId: string;
    insights: string;
    metrics?: unknown;
  };
}

export interface AIAskResponse {
  success: boolean;
  message: string;
  data: {
    projectId: string;
    question: string;
    answer: string;
  };
}


// ============================================================================
// Helper
// ============================================================================

const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  return token;
};


// ============================================================================
// Generate Project Summary
// ============================================================================

export const generateProjectSummary = async (
  projectId: string
): Promise<AISummaryResponse> => {

  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/summary`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to generate project summary."
    );
  }

  return result;
};


// ============================================================================
// Explain Dependency
// ============================================================================

export const explainDependency = async (
  projectId: string,
  source: string,
  target: string
): Promise<AIDependencyResponse> => {

  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/dependency-explanation`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },

      body: JSON.stringify({
        source,
        target,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      "Failed to generate dependency explanation."
    );
  }

  return result;
};


// ============================================================================
// Architecture Insights
// ============================================================================

export const generateArchitectureInsights = async (
  projectId: string
): Promise<AIArchitectureResponse> => {

  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/architecture`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      "Failed to generate architecture insights."
    );
  }

  return result;
};


// ============================================================================
// Ask Knected
// ============================================================================

export const askKnected = async (
  projectId: string,
  question: string
): Promise<AIAskResponse> => {

  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/ask`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },

      body: JSON.stringify({
        question,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      "Failed to get an answer from Knected AI."
    );
  }

  return result;
};