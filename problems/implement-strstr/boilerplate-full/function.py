#USER_CODE_HERE
import sys
from typing import List

# Set recursion limit higher for recursive problems
sys.setrecursionlimit(2000)

if __name__ == "__main__":
    # Input reading for the specific problem
    haystack = input().strip()
    needle = input().strip()

    sol = Solution()
    
    # Call the solution function
    result = sol.strStr(haystack, needle)
    
    # Print the result
    print(result)