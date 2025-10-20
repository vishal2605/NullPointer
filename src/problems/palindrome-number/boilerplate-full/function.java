//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        Solution sol = new Solution();
        bool result = sol.isPalindrome(x);
        System.out.println(result);
    }
}