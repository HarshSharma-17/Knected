"""
Purpose:
Tests the complete Knected analysis pipeline.

Responsibilities:
- Run complete project analysis
- Display final analysis data
"""

from analyzer.projectAnalysisPipeline import run_analysis


# Project path
project_path = "../Backend/src/temp/knected-test-project-1787619560789/knected-test-project"


# Run complete analysis
result = run_analysis(project_path)


print("Files analyzed:")
print(len(result["files"]))

print("\nGraph nodes:")
for node in result["graph"]["nodes"]:
    print(node)


print("\nGraph edges:")
for edge in result["graph"]["edges"]:
    print(edge)