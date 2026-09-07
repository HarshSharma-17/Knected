"""
Purpose:
Tests JavaScript file analysis.

Responsibilities:
- Load a real JavaScript file
- Run the JS analysis service
- Display detected dependencies
"""

from analyzer.jsAnalysisService import analyze_js_file


# Test file
file_path = "../Backend/src/temp/knected-test-project-1787619560789/knected-test-project/src/index.js"

# Analyze file
result = analyze_js_file(file_path)

print("File:", result["file"])
print("Dependencies:")

for dependency in result["dependencies"]:
    print(dependency)