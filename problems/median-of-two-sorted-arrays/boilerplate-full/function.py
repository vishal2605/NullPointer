#USER_CODE_HERE
import sys
from typing import List

# Set recursion limit higher for recursive problems
sys.setrecursionlimit(2000)

if __name__ == "__main__":
    # Input reading for the specific problem
    nums1 = list(map(int, input().split())) # List of integers from space-separated input
    nums2 = list(map(int, input().split())) # List of integers from space-separated input

    sol = Solution()
    
    # Call the solution function
    result = sol.findMedianSortedArrays(nums1, nums2)
    
    # Print the result
    print(result)