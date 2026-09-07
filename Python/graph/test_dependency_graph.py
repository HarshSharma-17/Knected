"""
Purpose:
Tests dependency graph generation.

Responsibilities:
- Analyze the test project
- Build its dependency graph
- Display nodes and edges
"""

from analyzer.projectAnalysisService import analyze_project
from graph.dependencyGraphService import build_dependency_graph

from graph.graphSerializer import serialize_graph


# Project path
project_path = "../Backend/src/temp/knected-test-project-1787619560789/knected-test-project"


# Analyze project
analysis_results = analyze_project(project_path)

# Build graph
graph = build_dependency_graph(analysis_results)

# Serialize graph
graph_data = serialize_graph(graph)

print("\nGraph JSON:")
print(graph_data)

print("Nodes:")
for node in graph.nodes(data=True):
    print(node)


print("\nEdges:")
for edge in graph.edges():
    print(edge)