//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Solution sol = new Solution();
        List<String> result = sol.generateParenthesis(n);
        System.out.println(result);
    }
}