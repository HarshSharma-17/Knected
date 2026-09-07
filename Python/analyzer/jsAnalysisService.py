''' purpose : analyze js files from a scanned project

response : read js source file
       parse them using the js parser
         extract dependencies
         return structured analysis 

'''

from pathlib import Path
from parser.js_parser import extract_dependencies

#analyze js file
def analyze_js_file(js_file_path):
    path = Path(js_file_path)

    source_code = path.read_text(encoding="utf-8")

    dependencies = extract_dependencies(source_code)

    return{
        "file": str(path),
        "dependencies": dependencies,
    }
