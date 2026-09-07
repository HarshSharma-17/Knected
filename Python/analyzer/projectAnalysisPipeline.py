'''purpose runs complete knected project analyssis pipeline

reponsibilities: analyze project files
                 build dependency graph 
                 serialize graph data 

'''

from analyzer.projectAnalysisService import analyze_project
from graph.dependencyGraphService import build_dependency_graph
from graph.graphSerializer import serialize_graph

# run complete project analysis
def run_analysis(project_path):
    #analyze project files
    analysis_results = analyze_project(project_path)

    #build dependency graph 
    graph = build_dependency_graph(analysis_results)

    #convert graph to api-ready data
    graph_data = serialize_graph(graph)

    return {
        "files": analysis_results,
        "graph": graph_data,
    }