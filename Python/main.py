''' purpose the command-line entry point for knected analysis.

responsisbillities - recieve the project path
                   - run the analysis pipeline
                - return graph data as json
'''

import json
import sys

from analyzer.projectAnalysisPipeline import run_analysis

#run analysis for the provided project
def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "success" : False,
            "error" : "Project path is required"
        }))

        sys.exit(1)
    
    project_path = sys.argv[1]

    try:
        result = run_analysis(project_path)

        print(json.dumps({
            "success" : True,
            "data" : result
        }))

    except Exception as error:
        print(json.dumps({
            "success" : False,
            "error" : str(error)
        }))

        sys.exit(1)

if __name__ == "__main__":
    main()