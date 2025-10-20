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
    string digits; cin >> digits;
    
    Solution sol;
    
    // Call the function
    vector<string> result = sol.letterCombinations(digits);
    
    // Print the result
    if constexpr (is_same<vector<string>, vector<int>>::value || is_same<vector<string>, vector<string>>::value) {
        // Use the overloaded operator<< for vectors
        cout << result << endl;
    } else {
        // Default output for primitive types
        cout << result << endl;
    }
    
    return 0;
}