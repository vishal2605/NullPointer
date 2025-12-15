//USER_CODE_HERE
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int dividend = sc.nextInt();
        int divisor = sc.nextInt();
        Solution sol = new Solution();
        int result = sol.divide(dividend, divisor);
        System.out.println(result);
    }
}