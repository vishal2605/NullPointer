//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        Solution sol = new Solution();
        int result = sol.lengthOfLongestSubstring(s);
        System.out.println(result);
    }
}