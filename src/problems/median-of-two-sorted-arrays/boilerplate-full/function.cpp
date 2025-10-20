//USER_CODE_HERE
#include <iostream>
#include <vector>
#include <string>
#include <type_traits> // Include for std::is_same
using namespace std;

// Function to print vector results (useful for debugging/output)
template<typename T>
ostream& operator<<(ostream& os, const vector<T>& v) {
    for (size_t i = 0; i < v.size(); ++i) {
        os << v[i] << (i == v.size() - 1 ? "" : " ");
    }
    return os;
}

int main() {
    // Read Inputs
    int nums1Size;
    cin >> nums1Size;
    vector<int> nums1(nums1Size);
    for(int i=0; i<nums1Size; i++) cin >> nums1[i];
    int nums2Size;
    cin >> nums2Size;
    vector<int> nums2(nums2Size);
    for(int i=0; i<nums2Size; i++) cin >> nums2[i];
    
    Solution sol;
    
    // Call the function
    float result = sol.findMedianSortedArrays(nums1, nums2);
    
    // Print the result
    if constexpr (is_same<float, vector<int>>::value || is_same<float, vector<string>>::value) {
        // Use the overloaded operator<< for vectors
        cout << result << endl;
    } else {
        // Default output for primitive types
        cout << result << endl;
    }
    
    return 0;
}