"""
Purpose:
Tests complete project analysis.

Responsibilities:
- Analyze the extracted project
- Display all analyzed files and dependencies
"""

from analyzer.projectAnalysisService import analyze_project


# Project path
project_path = "../Backend/src/temp/knected-test-project-1787619560789/knected-test-project"


# Analyze project
results = analyze_project(project_path)


print(f"Analyzed {len(results)} JavaScript files:\n")

for result in results:
    print("File:", result["file"])
    print("Dependencies:", result["dependencies"])
    print("-" * 50)