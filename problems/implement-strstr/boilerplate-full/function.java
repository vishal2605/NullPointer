//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String haystack = sc.next();
        String needle = sc.next();
        Solution sol = new Solution();
        int result = sol.strStr(haystack, needle);
        System.out.println(result);
    }
}