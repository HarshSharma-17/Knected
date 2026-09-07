"""
Analyze TypeScript and TSX source files.

Responsibilities:
- Read a TypeScript/TSX file
- Parse it with the TypeScript Tree-sitter parser
- Return the same result shape used by JavaScript analysis
"""

from pathlib import Path
from parser.ts_parser import extract_dependencies


def analyze_ts_file(ts_file_path):
    """Analyze one .ts or .tsx file."""
    path = Path(ts_file_path)

    source_code = path.read_text(encoding="utf-8")

    dependencies = extract_dependencies(
        source_code,
        tsx=path.suffix.lower() == ".tsx",
    )

    return {
        "file": str(path),
        "dependencies": dependencies,
    }
