/**
 * ============================================================================
 * File: projectService.ts
 * ----------------------------------------------------------------------------
 * Purpose:
 * Handles all frontend API communication related to Knected projects.
 *
 * Responsibilities:
 * - Fetch user's projects
 * - Fetch a single project
 * - Delete a project
 * ============================================================================
 */

const API_URL = "http://localhost:5000/api";

/* ============================================================================
   TYPES
============================================================================ */

export interface Project {
  _id: string;
  originalName?: string;
  fileName?: string;
  fileSize?: number;

  sourceType?: "zip" | "github";

  githubUrl?: string;
  githubOwner?: string;
  githubRepo?: string;

  analysis?: {
    files?: Array<{
      file: string;
      dependencies: string[];
    }>;

    graph?: {
      nodes?: Array<{
        id: string;
        name: string;
        type: string;
      }>;

      edges?: Array<{
        source: string;
        target: string;
      }>;
    };
  };

  createdAt?: string;
  updatedAt?: string;
}

/* ============================================================================
   GET TOKEN
============================================================================ */

const getToken = () => {
  return localStorage.getItem("token");
};

/* ============================================================================
   GET ALL PROJECTS
============================================================================ */

export const getProjects = async (): Promise<Project[]> => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_URL}/projects`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch projects."
    );
  }

  return result.data?.projects || result.data || [];
};

/* ============================================================================
   GET SINGLE PROJECT
============================================================================ */

export const getProject = async (
  projectId: string
): Promise<Project> => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/projects/${projectId}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch project."
    );
  }

  return result.data?.project || result.data;
};

/* ============================================================================
   DELETE PROJECT
============================================================================ */

export const deleteProject = async (
  projectId: string
) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL}/projects/${projectId}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to delete project."
    );
  }

  return result;
};