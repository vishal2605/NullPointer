//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String digits = sc.next();
        Solution sol = new Solution();
        List<String> result = sol.letterCombinations(digits);
        System.out.println(result);
    }
}