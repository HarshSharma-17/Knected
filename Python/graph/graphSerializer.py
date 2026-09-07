"""
Converts the NetworkX dependency graph into API-friendly JSON data.

Responsibilities:
- Serialize graph nodes
- Serialize graph edges
- Return frontend-ready graph data
"""

from pathlib import Path


# Serialize dependency graph
def serialize_graph(graph):
    nodes = []
    edges = []

    # Serialize nodes
    for node_id, data in graph.nodes(data=True):
        nodes.append({
            "id": node_id,
            "name": data.get("name") or Path(node_id).name,
            "type": data.get("type", "file"),
        })

    # Serialize edges
    for source, target in graph.edges():
        edges.append({
            "source": source,
            "target": target,
        })

    return {
        "nodes": nodes,
        "edges": edges,
    }