"""
Analyze a single Python file and return Knected's standard
{file, dependencies} result.
"""

from pathlib import Path
from parser.python_parser import extract_dependencies


def analyze_python_file(python_file_path):
    path = Path(python_file_path)
    source_code = path.read_text(encoding="utf-8")

    return {
        "file": str(path),
        "dependencies": extract_dependencies(source_code),
    }
