'''purpose : test the js parser

responsiblites:
   provide sample js code
   test ast parsing 
   display detected dependencies
'''

from js_parser import extract_dependencies

#test js code

source_code = """
   const user = require("./utils/user");
   import math from "./utils/math";

   console.log(user);
"""

#run parser
dependencies = extract_dependencies(source_code)
print("Detected dependencies:")

for dependency in dependencies:
    print(dependency)